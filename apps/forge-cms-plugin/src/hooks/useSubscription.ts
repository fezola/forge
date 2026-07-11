import { useMemo, useCallback } from "react";
import { subscriptionEngine, type CreateSubscriptionInput } from "../lib/subscriptionEngine";
import type {
  PaymentSubscription,
  PaymentCustomer,
  PaymentTransaction,
  SubscriptionStatus,
} from "../types/payments";

interface UseSubscriptionOptions {
  customers: PaymentCustomer[];
  transactions: PaymentTransaction[];
  subscriptions: PaymentSubscription[];
  onSubscriptionCreated?: (sub: PaymentSubscription) => void;
  onSubscriptionUpdated?: (sub: PaymentSubscription) => void;
  onInvoiceCreated?: (invoice: any) => void;
  onTransactionCreated?: (txn: PaymentTransaction) => void;
  onTransactionFailed?: (txn: PaymentTransaction, error: string) => void;
}

export function useSubscription(options: UseSubscriptionOptions) {
  const createSubscription = useCallback(
    (input: CreateSubscriptionInput) => {
      const { subscription } = subscriptionEngine.createSubscription(input);
      options.onSubscriptionCreated?.(subscription);
      return subscription;
    },
    [options.onSubscriptionCreated]
  );

  const cancelSubscription = useCallback(
    (id: string) => {
      const sub = options.subscriptions.find((s) => s.id === id);
      if (!sub) throw new Error("Subscription not found");
      const updated = subscriptionEngine.cancelSubscription(sub);
      options.onSubscriptionUpdated?.(updated);
      return updated;
    },
    [options.subscriptions, options.onSubscriptionUpdated]
  );

  const reactivateSubscription = useCallback(
    (id: string) => {
      const sub = options.subscriptions.find((s) => s.id === id);
      if (!sub) throw new Error("Subscription not found");
      const updated = subscriptionEngine.reactivateSubscription(sub);
      options.onSubscriptionUpdated?.(updated);
      return updated;
    },
    [options.subscriptions, options.onSubscriptionUpdated]
  );

  const billSubscription = useCallback(
    async (id: string) => {
      const sub = options.subscriptions.find((s) => s.id === id);
      if (!sub) throw new Error("Subscription not found");
      const result = await subscriptionEngine.billSubscription(
        sub,
        options.customers,
        options.transactions
      );
      if (result.success && result.subscription) {
        options.onSubscriptionUpdated?.(result.subscription);
        if (result.transaction) {
          options.onTransactionCreated?.(result.transaction);
        }
        if (result.invoice) {
          options.onInvoiceCreated?.(result.invoice);
        }
      }
      if (!result.success) {
        if (result.subscription) {
          options.onSubscriptionUpdated?.(result.subscription);
        }
      }
      return result;
    },
    [options.subscriptions, options.customers, options.transactions]
  );

  const processDueSubscriptions = useCallback(async () => {
    const results: { id: string; success: boolean; error?: string }[] = [];
    for (const sub of options.subscriptions) {
      if (subscriptionEngine.isDue(sub) && sub.status === "active") {
        const result = await subscriptionEngine.billSubscription(
          sub,
          options.customers,
          options.transactions
        );
        results.push({ id: sub.id, success: result.success, error: result.error });
        if (result.subscription) {
          options.onSubscriptionUpdated?.(result.subscription);
        }
      }
    }
    return results;
  }, [options.subscriptions, options.customers, options.transactions]);

  return {
    createSubscription,
    cancelSubscription,
    reactivateSubscription,
    billSubscription,
    processDueSubscriptions,
    engine: subscriptionEngine,
  };
}
