export interface Subscription {
  id: string;
  projectId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string | null;
  cancelledAt?: string | null;
  cancelAtPeriodEnd: boolean;
  providerSubscriptionId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired';

export interface CreateSubscriptionRequest {
  projectId: string;
  planId: string;
  trialDays?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateSubscriptionRequest {
  planId?: string;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, unknown>;
}
