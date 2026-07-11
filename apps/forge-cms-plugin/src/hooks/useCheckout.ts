import { useState, useCallback } from "react";
import {
  checkoutEngine,
  type CheckoutSession,
  type CheckoutMode,
} from "../lib/checkoutEngine";
import type { PaymentCoupon } from "../types/payments";

interface UseCheckoutOptions {
  productId: string;
  productName: string;
  productPrice: number;
  currency?: string;
  mode?: CheckoutMode;
}

export function useCheckout(options: UseCheckoutOptions) {
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initSession = useCallback(
    (opts?: { quantity?: number; customerEmail?: string; customerName?: string }) => {
      const s = checkoutEngine.createSession({
        productId: options.productId,
        productName: options.productName,
        productPrice: options.productPrice,
        currency: options.currency || "usd",
        mode: options.mode,
        quantity: opts?.quantity,
        customerEmail: opts?.customerEmail,
        customerName: opts?.customerName,
      });
      setSession(s);
      setError(null);
      return s;
    },
    [options]
  );

  const applyCoupon = useCallback(
    (coupon: PaymentCoupon) => {
      if (!session) {
        setError("No active session");
        return null;
      }
      const updated = checkoutEngine.applyCouponToSession(session.id, coupon);
      if (!updated) {
        setError("Invalid or expired coupon");
        return null;
      }
      setSession(updated);
      setError(null);
      return updated;
    },
    [session]
  );

  const removeCoupon = useCallback(() => {
    if (!session) return;
    const updated = checkoutEngine.removeCoupon(session.id);
    if (updated) setSession(updated);
  }, [session]);

  const updateQuantity = useCallback(
    (quantity: number) => {
      if (!session) {
        setError("No active session");
        return;
      }
      if (quantity < 1) quantity = 1;
      const updated = checkoutEngine.updateQuantity(session.id, quantity);
      if (updated) setSession(updated);
    },
    [session]
  );

  const completeSession = useCallback(
    (transactionId: string) => {
      if (!session) {
        setError("No active session");
        return null;
      }
      const completed = checkoutEngine.completeSession(session.id, transactionId);
      if (completed) setSession(completed);
      return completed;
    },
    [session]
  );

  const refreshSession = useCallback(() => {
    if (!session) return;
    const fresh = checkoutEngine.getSession(session.id);
    if (fresh) setSession(fresh);
    else setSession(null);
  }, [session]);

  return {
    session,
    loading,
    error,
    initSession,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    completeSession,
    refreshSession,
  };
}
