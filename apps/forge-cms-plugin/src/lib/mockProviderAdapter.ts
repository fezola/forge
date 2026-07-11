import type {
  ProviderAdapter,
  ProviderCredentials,
  PaymentSource,
  TransactionResult,
  RefundResult,
  CustomerResult,
  SubscriptionResult,
  CancelResult,
  WebhookResult,
  ConnectionResult,
  BalanceInfo,
  CustomerData,
  SubscriptionData,
  ProviderStatus,
} from "../types/providers";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

let txnCounter = 0;
let customerCounter = 0;
let subscriptionCounter = 0;
let webhookCounter = 0;

export class MockProviderAdapter implements ProviderAdapter {
  readonly id = "mock_provider";
  readonly name = "Mock Provider";
  readonly type = "mock" as const;

  private connected = false;
  private credentials: ProviderCredentials | null = null;
  private simulatedLatencyMs = 800;
  private successRate = 0.95;
  private storedTransactions: Map<string, { authorized: boolean; captured: boolean }> = new Map();

  setLatency(ms: number) {
    this.simulatedLatencyMs = ms;
  }

  setSuccessRate(rate: number) {
    this.successRate = Math.max(0, Math.min(1, rate));
  }

  async connect(credentials: ProviderCredentials): Promise<ConnectionResult> {
    await delay(this.simulatedLatencyMs * 0.5);
    this.connected = true;
    this.credentials = credentials;
    return { success: true, accountName: "Mock Account (Test)" };
  }

  async disconnect(): Promise<void> {
    await delay(200);
    this.connected = false;
    this.credentials = null;
  }

  async testConnection(): Promise<boolean> {
    await delay(this.simulatedLatencyMs * 0.3);
    return this.connected;
  }

  async charge(amount: number, currency: string, source: PaymentSource): Promise<TransactionResult> {
    await delay(this.simulatedLatencyMs);

    const txnId = `mock_txn_${String(++txnCounter).padStart(8, "0")}`;

    if (!this.connected) {
      return {
        success: false,
        providerTransactionId: txnId,
        amount,
        currency,
        status: "failed",
        error: "Provider not connected",
        raw: {},
      };
    }

    if (amount <= 0) {
      return {
        success: false,
        providerTransactionId: txnId,
        amount,
        currency,
        status: "failed",
        error: "Amount must be positive",
        raw: {},
      };
    }

    if (source.metadata?.["x-mock-fail"] === "true") {
      return {
        success: false,
        providerTransactionId: txnId,
        amount,
        currency,
        status: "failed",
        error: "Forced failure via x-mock-fail metadata",
        raw: { forced: true },
      };
    }

    const success = Math.random() < this.successRate;

    if (source.type === "crypto") {
      await delay(this.simulatedLatencyMs * 1.5);
    }

    this.storedTransactions.set(txnId, { authorized: true, captured: false });

    if (!success) {
      return {
        success: false,
        providerTransactionId: txnId,
        amount,
        currency,
        status: "failed",
        error: randomPick([
          "card_declined",
          "insufficient_funds",
          "fraud_suspected",
          "processing_error",
          "invalid_cvc",
          "expired_card",
        ]),
        raw: { decline_code: "generic_decline" },
      };
    }

    return {
      success: true,
      providerTransactionId: txnId,
      amount,
      currency,
      fee: Math.round(amount * 0.029 + 30),
      status: "succeeded",
      raw: {
        card_last4: source.cardLast4 || "4242",
        risk_score: Math.random(),
      },
    };
  }

  async refund(providerTransactionId: string, amount: number): Promise<RefundResult> {
    await delay(this.simulatedLatencyMs * 0.7);

    const refundId = `mock_rfnd_${String(randomInt(1000, 9999))}`;

    if (!this.storedTransactions.has(providerTransactionId)) {
      return {
        success: false,
        providerRefundId: refundId,
        amount,
        status: "failed",
        error: "Transaction not found",
      };
    }

    return {
      success: true,
      providerRefundId: refundId,
      amount,
      status: "succeeded",
    };
  }

  async createCustomer(data: CustomerData): Promise<CustomerResult> {
    await delay(this.simulatedLatencyMs * 0.4);
    const id = `mock_cus_${String(++customerCounter).padStart(6, "0")}`;
    return { success: true, providerCustomerId: id };
  }

  async updateCustomer(id: string, _data: Partial<CustomerData>): Promise<CustomerResult> {
    await delay(this.simulatedLatencyMs * 0.3);
    return { success: true, providerCustomerId: id };
  }

  async createSubscription(data: SubscriptionData): Promise<SubscriptionResult> {
    await delay(this.simulatedLatencyMs * 0.6);
    const id = `mock_sub_${String(++subscriptionCounter).padStart(6, "0")}`;
    const now = new Date();
    const periodEnd = new Date(now);
    if (data.interval === "month") periodEnd.setMonth(periodEnd.getMonth() + data.intervalCount);
    else if (data.interval === "year") periodEnd.setFullYear(periodEnd.getFullYear() + data.intervalCount);
    else if (data.interval === "week") periodEnd.setDate(periodEnd.getDate() + 7 * data.intervalCount);
    else periodEnd.setDate(periodEnd.getDate() + data.intervalCount);

    return {
      success: true,
      providerSubscriptionId: id,
      status: data.trialDays > 0 ? "trialing" : "active",
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
    };
  }

  async cancelSubscription(id: string): Promise<CancelResult> {
    await delay(300);
    return { success: true, canceledAt: new Date().toISOString() };
  }

  async registerWebhook(url: string, _events: string[]): Promise<WebhookResult> {
    await delay(500);
    const id = `mock_wh_${String(++webhookCounter).padStart(4, "0")}`;
    return { success: true, providerWebhookId: id };
  }

  async unregisterWebhook(_id: string): Promise<void> {
    await delay(300);
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expected = `sha256=mock_${secret.substring(0, 4)}_${payload.length}`;
    return signature === expected;
  }

  getStatus(): ProviderStatus {
    return this.connected ? "healthy" : "down";
  }

  async getBalance(): Promise<BalanceInfo> {
    await delay(400);
    return {
      available: 999999999,
      currency: "usd",
      pending: 0,
    };
  }
}
