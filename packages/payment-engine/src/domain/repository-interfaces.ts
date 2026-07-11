import type { Plan, PlanFeature, Subscription, Invoice, InvoiceLineItem, Payment, UsageRecord, Coupon, SubscriptionStatus, InvoiceStatus, PaymentStatus } from '@forge/payment-types';

export interface IPlanRepository {
  findAll(activeOnly?: boolean): Promise<Plan[]>;
  findPublic(): Promise<Plan[]>;
  findById(id: string): Promise<Plan | null>;
  findBySlug(slug: string): Promise<Plan | null>;
  create(data: { name: string; slug: string; description?: string; price: number; currency?: string; interval?: string; trialDays?: number; sortOrder?: number; active?: boolean; public?: boolean; maxProjects?: number; maxStorageGb?: number; maxIdentities?: number; maxBandwidthGb?: number; maxApiRequests?: number }): Promise<Plan>;
  update(id: string, data: Partial<Plan>): Promise<Plan>;
  delete(id: string): Promise<void>;
  addFeature(planId: string, feature: { key: string; name: string; value: string; highlight?: boolean }): Promise<PlanFeature>;
  removeFeature(featureId: string): Promise<void>;
}

export interface ISubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  findByProject(projectId: string): Promise<Subscription[]>;
  findActiveByProject(projectId: string): Promise<Subscription | null>;
  create(data: { projectId: string; planId: string; status?: SubscriptionStatus; currentPeriodStart?: Date; currentPeriodEnd: Date; trialEndsAt?: Date; providerSubscriptionId?: string; metadata?: Record<string, unknown> }): Promise<Subscription>;
  update(id: string, data: Partial<Subscription>): Promise<Subscription>;
  cancel(id: string, cancelAtPeriodEnd?: boolean): Promise<void>;
  findByStatus(status: SubscriptionStatus): Promise<Subscription[]>;
  findExpiringTrials(before: Date): Promise<Subscription[]>;
}

export interface IInvoiceRepository {
  findById(id: string): Promise<Invoice | null>;
  findBySubscription(subscriptionId: string): Promise<Invoice[]>;
  findByProject(projectId: string): Promise<Invoice[]>;
  findByStatus(status: InvoiceStatus): Promise<Invoice[]>;
  create(data: { subscriptionId: string; invoiceNumber: string; amount: number; currency?: string; description?: string; dueDate?: Date; status?: InvoiceStatus; providerInvoiceId?: string; metadata?: Record<string, unknown> }): Promise<Invoice>;
  addLineItem(invoiceId: string, item: { description: string; quantity?: number; unitPrice: number; amount: number; type?: string }): Promise<InvoiceLineItem>;
  markPaid(id: string, paidAmount: number, paidAt?: Date): Promise<Invoice>;
  update(id: string, data: Partial<Invoice>): Promise<Invoice>;
  generateInvoiceNumber(): Promise<string>;
}

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByInvoice(invoiceId: string): Promise<Payment[]>;
  create(data: { invoiceId: string; amount: number; currency?: string; status?: PaymentStatus; method?: string; providerPaymentId?: string; provider?: string; fee?: number; netAmount?: number; metadata?: Record<string, unknown> }): Promise<Payment>;
  update(id: string, data: Partial<Payment>): Promise<Payment>;
  markRefunded(id: string, amount: number): Promise<void>;
}

export interface IUsageRepository {
  record(data: { subscriptionId: string; metric: string; quantity?: number; metadata?: Record<string, unknown> }): Promise<UsageRecord>;
  getUsage(subscriptionId: string, metric: string, from: Date, to: Date): Promise<number>;
  getSummary(subscriptionId: string, from: Date, to: Date): Promise<{ metric: string; total: number }[]>;
  getBySubscription(subscriptionId: string): Promise<UsageRecord[]>;
}

export interface ICouponRepository {
  findByCode(code: string): Promise<Coupon | null>;
  findAll(activeOnly?: boolean): Promise<Coupon[]>;
  create(data: { code: string; description?: string; discountPercent?: number; discountAmount?: number; maxRedemptions?: number; expiresAt?: Date; active?: boolean }): Promise<Coupon>;
  update(id: string, data: Partial<Coupon>): Promise<Coupon>;
  delete(id: string): Promise<void>;
  incrementRedemptions(id: string): Promise<void>;
}
