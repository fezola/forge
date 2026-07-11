export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string | null;
  providerPaymentId?: string | null;
  provider?: string | null;
  fee?: number | null;
  netAmount?: number | null;
  refundedAt?: string | null;
  refundAmount?: number | null;
  createdAt: string;
}

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';
