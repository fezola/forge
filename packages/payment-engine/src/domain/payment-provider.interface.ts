import type { PaymentProviderType } from '@forge/payment-types';

export interface CreateCheckoutSessionInput {
  planId: string;
  projectId: string;
  returnUrl: string;
  trialDays?: number;
  metadata?: Record<string, unknown>;
}

export interface CheckoutSessionResult {
  url: string;
  sessionId: string;
}

export interface CreatePaymentIntentInput {
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentIntentResult {
  clientSecret: string;
  intentId: string;
}

export interface WebhookEvent {
  event: string;
  data: unknown;
}

export interface IPaymentProvider {
  readonly provider: PaymentProviderType;
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult>;
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
  handleWebhook(payload: unknown, signature: string): Promise<WebhookEvent>;
  cancelSubscription(providerSubscriptionId: string): Promise<void>;
  updateSubscription(providerSubscriptionId: string, data: { planId?: string; cancelAtPeriodEnd?: boolean }): Promise<void>;
}
