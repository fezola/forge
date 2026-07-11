import type { PaymentSubscription, PaymentInvoice, PaymentCustomer, PaymentTransaction, SubscriptionStatus, BillingInterval } from "../types/payments";
import type { PaymentProcessor, CreatePaymentInput } from "./paymentProcessor";
import { eventBus } from "./eventBus";

export interface CreateSubscriptionInput {
  customerId: string;
  customerEmail: string;
  customerName: string;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  interval: BillingInterval;
  intervalCount: number;
  trialDays: number;
  metadata?: Record<string, string>;
}

export interface UpgradeSubscriptionInput {
  newProductId: string;
  newProductName: string;
  newAmount: number;
}

export interface ProrationResult {
  credit: number;
  charge: number;
  netAmount: number;
  daysRemaining: number;
  totalDays: number;
}

export interface BillingResult {
  success: boolean;
  transaction?: PaymentTransaction;
  invoice?: PaymentInvoice;
  subscription?: PaymentSubscription;
  error?: string;
}

let subscriptionCounter = 0;

function generateSubId(): string {
  return `sub_${Date.now().toString(36)}_${String(++subscriptionCounter).padStart(4, "0")}`;
}

function generateInvId(): string {
  return `inv_${Date.now().toString(36)}_${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`;
}

function addInterval(date: Date, interval: BillingInterval, count: number): Date {
  const d = new Date(date);
  switch (interval) {
    case "day":
      d.setDate(d.getDate() + count);
      break;
    case "week":
      d.setDate(d.getDate() + 7 * count);
      break;
    case "month":
      d.setMonth(d.getMonth() + count);
      break;
    case "year":
      d.setFullYear(d.getFullYear() + count);
      break;
  }
  return d;
}

export class SubscriptionEngine {
  private processor: PaymentProcessor | null = null;

  setProcessor(processor: PaymentProcessor): void {
    this.processor = processor;
  }

  createSubscription(input: CreateSubscriptionInput): {
    subscription: PaymentSubscription;
    trialEnd?: string;
  } {
    const now = new Date();
    const trialEnd = input.trialDays > 0 ? addInterval(now, "day", input.trialDays) : undefined;
    const periodStart = trialEnd || now;
    const periodEnd = addInterval(periodStart, input.interval, input.intervalCount);

    const subscription: PaymentSubscription = {
      id: generateSubId(),
      customerId: input.customerId,
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      productId: input.productId,
      productName: input.productName,
      status: input.trialDays > 0 ? "trialing" : "active",
      amount: input.amount,
      currency: input.currency.toLowerCase(),
      interval: input.interval,
      intervalCount: input.intervalCount,
      trialDays: input.trialDays,
      trialEnd: trialEnd?.toISOString() || "",
      currentPeriodStart: periodStart.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      canceledAt: "",
      endedAt: "",
      createdAt: now.toISOString(),
      metadata: input.metadata || {},
    };

    eventBus.emit("subscription.created", subscription);
    return { subscription };
  }

  cancelSubscription(subscription: PaymentSubscription): PaymentSubscription {
    if (subscription.status === "canceled" || subscription.status === "expired") {
      throw new Error("Subscription is already canceled or expired");
    }

    subscription.status = "canceled";
    subscription.canceledAt = new Date().toISOString();

    eventBus.emit("subscription.canceled", subscription);
    return { ...subscription };
  }

  reactivateSubscription(subscription: PaymentSubscription): PaymentSubscription {
    if (subscription.status !== "canceled") {
      throw new Error("Only canceled subscriptions can be reactivated");
    }

    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);

    if (now.getTime() > periodEnd.getTime()) {
      throw new Error("Cannot reactivate: billing period has ended");
    }

    subscription.status = "active";
    subscription.canceledAt = "";
    subscription.currentPeriodStart = now.toISOString();

    eventBus.emit("subscription.reactivated", subscription);
    return { ...subscription };
  }

  calculateProration(
    oldAmount: number,
    newAmount: number,
    currentPeriodStart: string,
    currentPeriodEnd: string
  ): ProrationResult {
    const start = new Date(currentPeriodStart).getTime();
    const end = new Date(currentPeriodEnd).getTime();
    const now = Date.now();

    const totalDays = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, (end - now) / (1000 * 60 * 60 * 24));

    const unusedCredit = (oldAmount / 100) * (daysRemaining / totalDays);
    const newCost = newAmount / 100;
    const netAmount = newCost - unusedCredit;

    return {
      credit: Math.round(unusedCredit * 100),
      charge: Math.max(0, Math.round(netAmount * 100)),
      netAmount: Math.round(netAmount * 100),
      daysRemaining: Math.round(daysRemaining),
      totalDays: Math.round(totalDays),
    };
  }

  upgradeSubscription(
    subscription: PaymentSubscription,
    input: UpgradeSubscriptionInput
  ): { subscription: PaymentSubscription; proration: ProrationResult } {
    const proration = this.calculateProration(
      subscription.amount,
      input.newAmount,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd
    );

    subscription.productId = input.newProductId;
    subscription.productName = input.newProductName;
    subscription.amount = input.newAmount;

    eventBus.emit("subscription.upgraded", { subscription, proration });
    return { subscription: { ...subscription }, proration };
  }

  downgradeSubscription(
    subscription: PaymentSubscription,
    input: UpgradeSubscriptionInput
  ): { subscription: PaymentSubscription; proration: ProrationResult } {
    const proration = this.calculateProration(
      input.newAmount,
      subscription.amount,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd
    );

    subscription.productId = input.newProductId;
    subscription.productName = input.newProductName;
    subscription.amount = input.newAmount;

    eventBus.emit("subscription.downgraded", { subscription, proration });
    return { subscription: { ...subscription }, proration };
  }

  isDue(subscription: PaymentSubscription): boolean {
    if (subscription.status !== "active" && subscription.status !== "trialing") {
      return false;
    }
    return Date.now() >= new Date(subscription.currentPeriodEnd).getTime();
  }

  advanceBillingPeriod(subscription: PaymentSubscription): PaymentSubscription {
    const currentEnd = new Date(subscription.currentPeriodEnd);
    const nextEnd = addInterval(currentEnd, subscription.interval, subscription.intervalCount);

    subscription.currentPeriodStart = subscription.currentPeriodEnd;
    subscription.currentPeriodEnd = nextEnd.toISOString();

    return { ...subscription };
  }

  async billSubscription(
    subscription: PaymentSubscription,
    customers: PaymentCustomer[],
    transactions: PaymentTransaction[]
  ): Promise<BillingResult> {
    if (!this.processor) {
      return { success: false, error: "Payment processor not configured" };
    }

    const customer = customers.find((c) => c.id === subscription.customerId);
    if (!customer) {
      return { success: false, error: "Customer not found" };
    }

    const chargeInput: CreatePaymentInput = {
      amount: subscription.amount,
      currency: subscription.currency,
      customerId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      productId: subscription.productId,
      productName: subscription.productName,
      description: `${subscription.productName} (${subscription.interval}ly billing)`,
      paymentMethod: "card",
      source: { type: "card", cardLast4: "4242" },
      metadata: { subscriptionId: subscription.id },
    };

    const result = await this.processor.process(chargeInput);

    if (!result.success || !result.transaction) {
      subscription.status = "past_due";

      const retryCount = parseInt(subscription.metadata.retryCount || "0", 10);
      subscription.metadata.retryCount = String(retryCount + 1);

      eventBus.emit("subscription.past_due", { subscription, error: result.error });
      return {
        success: false,
        subscription: { ...subscription },
        error: result.error || "Payment failed",
      };
    }

    const txn = result.transaction;
    subscription.status = "active";

    const updatedSub = this.advanceBillingPeriod(subscription);
    updatedSub.metadata.retryCount = "0";

    const invoice: PaymentInvoice = {
      id: generateInvId(),
      number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      customerId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      subscriptionId: subscription.id,
      status: "paid",
      amount: txn.amount,
      amountPaid: txn.amount,
      amountDue: 0,
      currency: txn.currency,
      items: [
        {
          id: `item_${Date.now()}`,
          description: `${subscription.productName} - ${subscription.interval}ly`,
          quantity: 1,
          unitAmount: subscription.amount,
          amount: subscription.amount,
          currency: subscription.currency,
        },
      ],
      dueDate: new Date(subscription.currentPeriodEnd).toISOString(),
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      pdfUrl: "",
      notes: "",
    };

    eventBus.emit("subscription.billed", { subscription: updatedSub, transaction: txn, invoice });
    eventBus.emit("invoice.paid", invoice);

    return { success: true, transaction: txn, invoice, subscription: updatedSub };
  }

  canRetry(subscription: PaymentSubscription): boolean {
    if (subscription.status !== "past_due") return false;
    const retries = parseInt(subscription.metadata.retryCount || "0", 10);
    return retries < 3;
  }
}

export function isSubscriptionDue(sub: PaymentSubscription): boolean {
  const engine = new SubscriptionEngine();
  return engine.isDue(sub);
}

export function calculateNextBilling(from: Date, interval: BillingInterval, count: number): Date {
  return addInterval(from, interval, count);
}

export const subscriptionEngine = new SubscriptionEngine();
