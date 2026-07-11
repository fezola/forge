export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  maxRedemptions?: number | null;
  currentRedemptions: number;
  expiresAt?: string | null;
  active: boolean;
  createdAt: string;
}
