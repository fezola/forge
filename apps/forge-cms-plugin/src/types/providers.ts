export type ProviderType = "stripe" | "paystack" | "flutterwave" | "bridge" | "circle" | "coinbase" | "monnify" | "solana-pay" | "mock";

export type ProviderStatus = "healthy" | "degraded" | "down";

export interface ProviderCredentials {
  apiKey?: string;
  secretKey?: string;
  environment: "test" | "live";
  additional?: Record<string, string>;
}

export interface PaymentSource {
  type: "card" | "crypto" | "wallet" | "bank";
  token?: string;
  walletAddress?: string;
  cardLast4?: string;
  savedPaymentMethodId?: string;
  metadata?: Record<string, string>;
}

export interface TransactionResult {
  success: boolean;
  providerTransactionId: string;
  amount: number;
  currency: string;
  fee?: number;
  status: "succeeded" | "pending" | "failed";
  error?: string;
  raw: Record<string, unknown>;
}

export interface RefundResult {
  success: boolean;
  providerRefundId: string;
  amount: number;
  status: "succeeded" | "pending" | "failed";
  error?: string;
}

export interface CustomerResult {
  success: boolean;
  providerCustomerId: string;
  error?: string;
}

export interface SubscriptionResult {
  success: boolean;
  providerSubscriptionId: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  error?: string;
}

export interface CancelResult {
  success: boolean;
  canceledAt: string;
  error?: string;
}

export interface WebhookResult {
  success: boolean;
  providerWebhookId: string;
  error?: string;
}

export interface ConnectionResult {
  success: boolean;
  accountName: string;
  error?: string;
}

export interface BalanceInfo {
  available: number;
  currency: string;
  pending: number;
}

export interface CustomerData {
  email: string;
  name: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionData {
  customerId: string;
  productId: string;
  interval: "day" | "week" | "month" | "year";
  intervalCount: number;
  trialDays: number;
  metadata?: Record<string, string>;
}

export interface ProviderAdapter {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType;

  connect(credentials: ProviderCredentials): Promise<ConnectionResult>;
  disconnect(): Promise<void>;
  testConnection(): Promise<boolean>;

  charge(amount: number, currency: string, source: PaymentSource): Promise<TransactionResult>;
  refund(providerTransactionId: string, amount: number): Promise<RefundResult>;

  createCustomer(data: CustomerData): Promise<CustomerResult>;
  updateCustomer(id: string, data: Partial<CustomerData>): Promise<CustomerResult>;

  createSubscription(data: SubscriptionData): Promise<SubscriptionResult>;
  cancelSubscription(id: string): Promise<CancelResult>;

  registerWebhook(url: string, events: string[]): Promise<WebhookResult>;
  unregisterWebhook(id: string): Promise<void>;
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;

  getStatus(): ProviderStatus;
  getBalance(): Promise<BalanceInfo>;
}
