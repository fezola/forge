export type PaymentProviderType = 'stripe' | 'paypal' | 'lemon_squeezy' | 'paddle';

export interface PaymentProviderConfig {
  id: string;
  provider: PaymentProviderType;
  enabled: boolean;
  config?: Record<string, unknown> | null;
  createdAt: string;
}

export interface InitiatePaymentRequest {
  invoiceId: string;
  provider: PaymentProviderType;
  returnUrl: string;
}

export interface PaymentProviderInterface {
  createCheckoutSession(data: { planId: string; projectId: string; returnUrl: string; trialDays?: number }): Promise<{ url: string; sessionId: string }>;
  createPaymentIntent(data: { amount: number; currency: string; metadata?: Record<string, unknown> }): Promise<{ clientSecret: string; intentId: string }>;
  handleWebhook(payload: unknown, signature: string): Promise<{ event: string; data: unknown }>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  updateSubscription(subscriptionId: string, data: { planId?: string; cancelAtPeriodEnd?: boolean }): Promise<void>;
}
