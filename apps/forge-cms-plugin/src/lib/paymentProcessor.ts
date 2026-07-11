import type { ProviderAdapter, PaymentSource } from "../types/providers";
import type {
  PaymentTransaction,
  PaymentRefund,
  PaymentCustomer,
  PaymentSubscription,
  PaymentsState,
  PaymentStatus,
} from "../types/payments";
import { eventBus } from "./eventBus";

export interface CreatePaymentInput {
  amount: number;
  currency: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  productId?: string;
  productName?: string;
  description?: string;
  paymentMethod: string;
  source: PaymentSource;
  metadata?: Record<string, string>;
}

export interface ProcessPaymentResult {
  success: boolean;
  transaction?: PaymentTransaction;
  error?: string;
  providerError?: string;
}

export interface IssueRefundInput {
  transactionId: string;
  amount: number;
  reason: string;
  notes?: string;
}

export interface IssueRefundResult {
  success: boolean;
  refund?: PaymentRefund;
  transaction?: PaymentTransaction;
  error?: string;
}

export interface PipelineMetrics {
  totalProcessed: number;
  totalSucceeded: number;
  totalFailed: number;
  averageLatencyMs: number;
}

let txnCounter = 0;
let refundCounter = 0;

function generateId(prefix: string): string {
  const n = ++txnCounter;
  return `${prefix}_${Date.now().toString(36)}_${n.toString(36).padStart(4, "0")}`;
}

function generateRefundId(): string {
  return `rfnd_${Date.now().toString(36)}_${String(++refundCounter).padStart(3, "0")}`;
}

export class PaymentProcessor {
  private provider: ProviderAdapter;
  private metrics: { timestamps: number[]; succeeded: number; failed: number } = {
    timestamps: [],
    succeeded: 0,
    failed: 0,
  };

  constructor(provider: ProviderAdapter) {
    this.provider = provider;
  }

  setProvider(provider: ProviderAdapter) {
    this.provider = provider;
  }

  getProvider(): ProviderAdapter {
    return this.provider;
  }

  async process(input: CreatePaymentInput): Promise<ProcessPaymentResult> {
    const startTime = Date.now();

    // Stage 1: Create
    const transaction = this.createTransaction(input);
    eventBus.emit("payment.creating", transaction);

    // Stage 2: Validate
    const validationError = this.validate(transaction);
    if (validationError) {
      transaction.status = "failed";
      transaction.metadata.failure_reason = validationError;
      this.recordMetric(false);
      eventBus.emit("payment.failed", { transaction, error: validationError });
      return { success: false, transaction, error: validationError };
    }

    // Stage 3: Authorize
    let chargeResult;
    try {
      chargeResult = await this.provider.charge(
        transaction.amount,
        transaction.currency,
        input.source
      );
    } catch (err) {
      transaction.status = "failed";
      transaction.metadata.failure_reason = "provider_error";
      transaction.metadata.provider_error = err instanceof Error ? err.message : String(err);
      this.recordMetric(false);
      eventBus.emit("payment.failed", { transaction, error: transaction.metadata.provider_error });
      return { success: false, transaction, error: "Provider communication error" };
    }

    if (!chargeResult.success) {
      transaction.status = "failed";
      transaction.metadata.failure_reason = chargeResult.error || "provider_decline";
      transaction.metadata.provider_code = chargeResult.error || "unknown";
      transaction.updatedAt = new Date().toISOString();
      this.recordMetric(false);
      eventBus.emit("payment.failed", { transaction, error: chargeResult.error });
      return {
        success: false,
        transaction,
        error: "Payment declined by provider",
        providerError: chargeResult.error,
      };
    }

    // Stage 4: Capture (immediate capture = sale)
    transaction.status = "succeeded";
    transaction.paymentMethod = input.paymentMethod;
    transaction.metadata.providerTransactionId = chargeResult.providerTransactionId;
    if (chargeResult.fee !== undefined) {
      transaction.metadata.providerFee = String(chargeResult.fee);
    }
    transaction.updatedAt = new Date().toISOString();

    // Stage 5: Settle (synchronous for mock)
    // In production this would be async via webhook
    transaction.metadata.settled = "true";
    transaction.metadata.settledAt = new Date().toISOString();

    // Stage 6: Confirm
    this.recordMetric(true);
    eventBus.emit("payment.succeeded", transaction);
    eventBus.emit("transaction.updated", transaction);

    return { success: true, transaction };
  }

  async refund(input: IssueRefundInput, transactions: PaymentTransaction[]): Promise<IssueRefundResult> {
    const transaction = transactions.find((t) => t.id === input.transactionId);
    if (!transaction) {
      return { success: false, error: "Transaction not found" };
    }

    if (transaction.status === "refunded") {
      return { success: false, error: "Transaction already refunded" };
    }

    if (input.amount > transaction.amount) {
      return { success: false, error: "Refund amount exceeds transaction amount" };
    }

    const providerTxnId = transaction.metadata.providerTransactionId;
    if (!providerTxnId) {
      return { success: false, error: "No provider transaction ID found" };
    }

    // Stage 7: Reverse
    let refundResult;
    try {
      refundResult = await this.provider.refund(providerTxnId, input.amount);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Refund communication error",
      };
    }

    if (!refundResult.success) {
      return {
        success: false,
        error: refundResult.error || "Provider refund failed",
      };
    }

    // Stage 8: Settle
    const refund: PaymentRefund = {
      id: generateRefundId(),
      transactionId: transaction.id,
      amount: input.amount,
      currency: transaction.currency,
      reason: input.reason,
      status: "succeeded",
      notes: input.notes || "",
      createdAt: new Date().toISOString(),
    };

    // Stage 9: Confirm
    const isFullRefund = input.amount >= transaction.amount;
    transaction.status = isFullRefund ? "refunded" : "partially_refunded";
    transaction.updatedAt = new Date().toISOString();

    eventBus.emit("payment.refunded", { refund, transaction });
    eventBus.emit("transaction.updated", transaction);

    return { success: true, refund, transaction };
  }

  getMetrics(): PipelineMetrics {
    const timestamps = this.metrics.timestamps;
    const total = timestamps.length;
    const avgLatency = total > 0
      ? timestamps.reduce((a, b) => a + b, 0) / total
      : 0;

    return {
      totalProcessed: total,
      totalSucceeded: this.metrics.succeeded,
      totalFailed: this.metrics.failed,
      averageLatencyMs: Math.round(avgLatency),
    };
  }

  resetMetrics(): void {
    this.metrics = { timestamps: [], succeeded: 0, failed: 0 };
  }

  private createTransaction(input: CreatePaymentInput): PaymentTransaction {
    return {
      id: generateId("txn"),
      amount: input.amount,
      currency: input.currency.toLowerCase(),
      status: "pending",
      customerId: input.customerId,
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      productId: input.productId || "",
      productName: input.productName || "",
      description: input.description || "Payment",
      paymentMethod: input.paymentMethod,
      invoiceId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: { ...input.metadata },
    };
  }

  private validate(transaction: PaymentTransaction): string | null {
    if (transaction.amount <= 0) return "Amount must be positive";
    if (transaction.amount > 99999999) return "Amount exceeds maximum";
    if (!transaction.currency || transaction.currency.length !== 3) return "Invalid currency";
    if (!transaction.customerId) return "Customer ID is required";
    if (!transaction.customerEmail) return "Customer email is required";
    return null;
  }

  private recordMetric(success: boolean): void {
    if (success) this.metrics.succeeded++;
    else this.metrics.failed++;
  }
}

export function computePaymentsKPI(state: PaymentsState): {
  totalRevenue: number;
  totalTransactions: number;
  mrr: number;
  conversionRate: number;
  averageOrderValue: number;
  pendingPayouts: number;
} {
  const succeeded = state.transactions.filter((t) => t.status === "succeeded");
  const totalRevenue = succeeded.reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = state.transactions.length;
  const mrr = state.subscriptions
    .filter((s) => s.status === "active" || s.status === "trialing")
    .reduce((sum, s) => sum + s.amount, 0);
  const pendingPayouts = state.transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalRevenue,
    totalTransactions,
    mrr,
    conversionRate: 26.6,
    averageOrderValue: totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0,
    pendingPayouts,
  };
}
