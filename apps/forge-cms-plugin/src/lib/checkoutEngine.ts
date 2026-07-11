import type { PaymentCoupon } from "../types/payments";
import { eventBus } from "./eventBus";

export type CheckoutMode = "payment" | "subscription" | "setup";

export type CheckoutSessionStatus = "open" | "completed" | "expired";

export interface CheckoutSession {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  currency: string;
  quantity: number;
  mode: CheckoutMode;
  couponCode?: string;
  couponId?: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, string>;

  subtotal: number;
  discount: number;
  discountLabel: string;
  total: number;

  status: CheckoutSessionStatus;
  paymentIntentId?: string;
  transactionId?: string;
  createdAt: number;
  expiresAt: number;
  completedAt?: number;
}

export interface DiscountBreakdown {
  amount: number;
  label: string;
  type: "percentage" | "fixed_amount";
  code: string;
}

export interface CouponValidationResult {
  valid: boolean;
  reason?: string;
  coupon?: PaymentCoupon;
}

export interface ApplyCouponInput {
  code: string;
  subtotal: number;
  currency: string;
}

let sessionCounter = 0;

function generateSessionId(): string {
  return `cs_${Date.now().toString(36)}_${String(++sessionCounter).padStart(4, "0")}`;
}

function createSessionExpiry(): number {
  return Date.now() + 24 * 60 * 60 * 1000;
}

export class CheckoutEngine {
  private sessions: Map<string, CheckoutSession> = new Map();

  validateCoupon(
    coupon: PaymentCoupon,
    subtotal: number,
    _currency: string
  ): CouponValidationResult {
    if (!coupon.isActive) {
      return { valid: false, reason: "Coupon is no longer active" };
    }

    if (coupon.maxRedemptions > 0 && coupon.timesRedeemed >= coupon.maxRedemptions) {
      return { valid: false, reason: "Coupon has reached maximum redemptions" };
    }

    if (coupon.activeUntil) {
      const until = new Date(coupon.activeUntil).getTime();
      if (Date.now() > until) {
        return { valid: false, reason: "Coupon has expired" };
      }
    }

    if (coupon.activeFrom) {
      const from = new Date(coupon.activeFrom).getTime();
      if (Date.now() < from) {
        return { valid: false, reason: "Coupon is not yet active" };
      }
    }

    if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        reason: `Minimum order amount of ${formatAmount(coupon.minOrderAmount, "usd")} required`,
      };
    }

    return { valid: true, coupon };
  }

  applyCoupon(coupon: PaymentCoupon, subtotal: number): number {
    if (coupon.type === "percentage") {
      return Math.round(subtotal * (coupon.value / 100) * 100) / 100;
    } else {
      const discount = coupon.value / 100;
      return Math.min(discount, subtotal);
    }
  }

  getDiscountBreakdown(coupon: PaymentCoupon, subtotal: number): DiscountBreakdown {
    const discount = this.applyCoupon(coupon, subtotal);
    const label =
      coupon.type === "percentage"
        ? `${coupon.value}% off`
        : `-${formatAmount(coupon.value / 100, "usd")}`;

    return {
      amount: discount,
      label,
      type: coupon.type === "percentage" ? "percentage" : "fixed_amount",
      code: coupon.code,
    };
  }

  computeTotals(
    price: number,
    quantity: number,
    coupon?: PaymentCoupon
  ): { subtotal: number; discount: number; discountLabel: string; total: number } {
    const subtotal = Math.round(price * quantity * 100) / 100;

    let discount = 0;
    let discountLabel = "";

    if (coupon) {
      discount = this.applyCoupon(coupon, subtotal);
      const breakdown = this.getDiscountBreakdown(coupon, subtotal);
      discountLabel = breakdown.label;
    }

    const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);

    return { subtotal, discount, discountLabel, total };
  }

  createSession(params: {
    productId: string;
    productName: string;
    productPrice: number;
    currency: string;
    quantity?: number;
    mode?: CheckoutMode;
    customerEmail?: string;
    customerName?: string;
    couponCode?: string;
    metadata?: Record<string, string>;
  }): CheckoutSession {
    const quantity = params.quantity || 1;
    const mode = params.mode || "payment";

    const { subtotal, discount, discountLabel, total } = this.computeTotals(
      params.productPrice,
      quantity,
      undefined
    );

    const session: CheckoutSession = {
      id: generateSessionId(),
      productId: params.productId,
      productName: params.productName,
      productPrice: params.productPrice,
      currency: params.currency.toLowerCase(),
      quantity,
      mode,
      couponCode: params.couponCode,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      metadata: params.metadata,
      subtotal,
      discount,
      discountLabel,
      total,
      status: "open",
      createdAt: Date.now(),
      expiresAt: createSessionExpiry(),
    };

    this.sessions.set(session.id, session);
    eventBus.emit("checkout.created", session);

    return session;
  }

  updateQuantity(sessionId: string, quantity: number, coupon?: PaymentCoupon): CheckoutSession | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "open") return null;

    const { subtotal, discount, discountLabel, total } = this.computeTotals(
      session.productPrice,
      quantity,
      coupon
    );

    session.quantity = quantity;
    session.subtotal = subtotal;
    session.discount = discount;
    session.discountLabel = discountLabel;
    session.total = total;

    return { ...session };
  }

  applyCouponToSession(sessionId: string, coupon: PaymentCoupon): CheckoutSession | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "open") return null;

    const validation = this.validateCoupon(coupon, session.subtotal, session.currency);
    if (!validation.valid) return null;

    const { subtotal, discount, discountLabel, total } = this.computeTotals(
      session.productPrice,
      session.quantity,
      coupon
    );

    session.couponCode = coupon.code;
    session.couponId = coupon.id;
    session.subtotal = subtotal;
    session.discount = discount;
    session.discountLabel = discountLabel;
    session.total = total;

    return { ...session };
  }

  removeCoupon(sessionId: string): CheckoutSession | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "open") return null;

    session.couponCode = undefined;
    session.couponId = undefined;

    const { subtotal, discount, discountLabel, total } = this.computeTotals(
      session.productPrice,
      session.quantity,
      undefined
    );

    session.subtotal = subtotal;
    session.discount = discount;
    session.discountLabel = discountLabel;
    session.total = total;

    return { ...session };
  }

  completeSession(
    sessionId: string,
    transactionId: string
  ): CheckoutSession | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "open") return null;

    session.status = "completed";
    session.transactionId = transactionId;
    session.completedAt = Date.now();

    eventBus.emit("checkout.completed", session);

    return { ...session };
  }

  expireSession(sessionId: string): CheckoutSession | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "open") return null;

    session.status = "expired";
    eventBus.emit("checkout.expired", session);

    return { ...session };
  }

  getSession(sessionId: string): CheckoutSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session && session.status === "open" && Date.now() > session.expiresAt) {
      this.expireSession(sessionId);
      return undefined;
    }
    return session ? { ...session } : undefined;
  }

  expireStaleSessions(): number {
    let expired = 0;
    for (const [id, session] of this.sessions) {
      if (session.status === "open" && Date.now() > session.expiresAt) {
        session.status = "expired";
        eventBus.emit("checkout.expired", session);
        expired++;
      }
    }
    return expired;
  }

  clearExpiredSessions(): void {
    for (const [id, session] of this.sessions) {
      if (session.status === "expired") {
        this.sessions.delete(id);
      }
    }
  }

  getActiveSessions(): CheckoutSession[] {
    this.expireStaleSessions();
    return Array.from(this.sessions.values()).filter((s) => s.status === "open");
  }
}

export function formatAmount(amount: number, currency: string): string {
  const locale = currency === "usd" ? "en-US" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function formatDiscountLine(
  subtotal: number,
  coupon: PaymentCoupon
): { originalTotal: string; discountedTotal: string; savings: string } {
  const engine = new CheckoutEngine();
  const discount = engine.applyCoupon(coupon, subtotal);
  const total = Math.max(0, subtotal - discount);

  return {
    originalTotal: formatAmount(subtotal, "usd"),
    discountedTotal: formatAmount(total, "usd"),
    savings: formatAmount(discount, "usd"),
  };
}

export const checkoutEngine = new CheckoutEngine();
