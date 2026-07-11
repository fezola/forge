export type PaymentStatus = "succeeded" | "pending" | "failed" | "refunded" | "partially_refunded";
export type BillingInterval = "month" | "year" | "week" | "day";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "expired" | "incomplete" | "paused";

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  customerId: string;
  customerEmail: string;
  customerName: string;
  productId: string;
  productName: string;
  description: string;
  paymentMethod: string;
  invoiceId: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, string>;
}

export interface PaymentCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  totalSpent: number;
  totalTransactions: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, string>;
}

export interface PaymentSubscription {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  productId: string;
  productName: string;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  interval: BillingInterval;
  intervalCount: number;
  trialDays: number;
  trialEnd: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string;
  endedAt: string;
  createdAt: string;
  metadata: Record<string, string>;
}

export interface PaymentInvoice {
  id: string;
  number: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  subscriptionId: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  amount: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  items: PaymentInvoiceItem[];
  dueDate: string;
  paidAt: string;
  createdAt: string;
  pdfUrl: string;
  notes: string;
}

export interface PaymentInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
  currency: string;
}

export interface PaymentCoupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  appliesTo: "all" | string[];
  maxRedemptions: number;
  timesRedeemed: number;
  minOrderAmount: number;
  duration: "forever" | "once" | "limited";
  durationMonths: number;
  activeFrom: string;
  activeUntil: string;
  isActive: boolean;
  createdAt: string;
}

export interface PaymentLink {
  id: string;
  name: string;
  url: string;
  productId: string;
  productName: string;
  allowQuantity: boolean;
  checkoutStyle: "minimal" | "branded" | "full-page";
  views: number;
  checkouts: number;
  revenue: number;
  isActive: boolean;
  createdAt: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  type: "stripe" | "paystack" | "flutterwave" | "bridge" | "circle" | "coinbase" | "monnify" | "solana-pay";
  connected: boolean;
  environment: "live" | "test";
  accountName: string;
  createdAt: string;
}

export interface WalletConnection {
  id: string;
  network: string;
  address: string;
  label: string;
  balance: number;
  balanceUsd: number;
  connectedAt: string;
  isActive: boolean;
}

export interface PaymentWebhook {
  id: string;
  url: string;
  description: string;
  secret: string;
  events: string[];
  isActive: boolean;
  lastDeliveryAt: string;
  lastDeliveryStatus: "success" | "failed";
  createdAt: string;
}

export interface PaymentRefund {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  reason: string;
  status: "succeeded" | "pending" | "failed";
  notes: string;
  createdAt: string;
}

export interface PaymentsState {
  transactions: PaymentTransaction[];
  customers: PaymentCustomer[];
  subscriptions: PaymentSubscription[];
  invoices: PaymentInvoice[];
  coupons: PaymentCoupon[];
  paymentLinks: PaymentLink[];
  providers: PaymentProvider[];
  wallets: WalletConnection[];
  webhooks: PaymentWebhook[];
  refunds: PaymentRefund[];
  mrr: number;
  totalRevenue: number;
  totalTransactions: number;
  conversionRate: number;
}

export const DEFAULT_PAYMENTS_STATE: PaymentsState = {
  transactions: [],
  customers: [],
  subscriptions: [],
  invoices: [],
  coupons: [],
  paymentLinks: [],
  providers: [],
  wallets: [],
  webhooks: [],
  refunds: [],
  mrr: 0,
  totalRevenue: 0,
  totalTransactions: 0,
  conversionRate: 0,
};

export const PAYMENTS_STORAGE_KEY = "forgePaymentsState";

export type PaymentsView = "dashboard" | "transactions" | "customers" | "subscriptions" | "invoices" | "products" | "coupons" | "payment-links" | "providers" | "wallets" | "webhooks" | "refunds";
