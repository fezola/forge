import { useState, useCallback, useEffect } from "react";
import { generateSeedData } from "../lib/seedData";
import {
  PaymentsState,
  PaymentTransaction,
  PaymentCustomer,
  PaymentSubscription,
  PaymentInvoice,
  PaymentCoupon,
  PaymentLink,
  PaymentProvider,
  WalletConnection,
  PaymentWebhook,
  PaymentRefund,
  DEFAULT_PAYMENTS_STATE,
  PAYMENTS_STORAGE_KEY,
} from "../types/payments";

function loadState(): PaymentsState {
  try {
    const raw = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (raw) return { ...DEFAULT_PAYMENTS_STATE, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_PAYMENTS_STATE };
}

export function usePayments() {
  const [state, setState] = useState<PaymentsState>(loadState);

  useEffect(() => {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = useCallback((patch: Partial<PaymentsState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const addTransaction = useCallback((tx: PaymentTransaction) => {
    setState((prev) => ({
      ...prev,
      transactions: [tx, ...prev.transactions],
      totalTransactions: prev.totalTransactions + 1,
      totalRevenue: prev.totalRevenue + tx.amount,
    }));
  }, []);

  const updateTransaction = useCallback((id: string, patch: Partial<PaymentTransaction>) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === id ? { ...t, ...patch } : t
      ),
    }));
  }, []);

  const addCustomer = useCallback((c: PaymentCustomer) => {
    setState((prev) => ({
      ...prev,
      customers: [c, ...prev.customers],
    }));
  }, []);

  const addSubscription = useCallback((sub: PaymentSubscription) => {
    setState((prev) => ({
      ...prev,
      subscriptions: [sub, ...prev.subscriptions],
    }));
  }, []);

  const updateSubscription = useCallback((id: string, patch: Partial<PaymentSubscription>) => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    }));
  }, []);

  const addInvoice = useCallback((inv: PaymentInvoice) => {
    setState((prev) => ({
      ...prev,
      invoices: [inv, ...prev.invoices],
    }));
  }, []);

  const addCoupon = useCallback((c: PaymentCoupon) => {
    setState((prev) => ({
      ...prev,
      coupons: [c, ...prev.coupons],
    }));
  }, []);

  const addPaymentLink = useCallback((pl: PaymentLink) => {
    setState((prev) => ({
      ...prev,
      paymentLinks: [pl, ...prev.paymentLinks],
    }));
  }, []);

  const addProvider = useCallback((p: PaymentProvider) => {
    setState((prev) => ({
      ...prev,
      providers: [...prev.providers, p],
    }));
  }, []);

  const connectWallet = useCallback((w: WalletConnection) => {
    setState((prev) => ({
      ...prev,
      wallets: [w, ...prev.wallets],
    }));
  }, []);

  const addWebhook = useCallback((w: PaymentWebhook) => {
    setState((prev) => ({
      ...prev,
      webhooks: [w, ...prev.webhooks],
    }));
  }, []);

  const addRefund = useCallback((r: PaymentRefund) => {
    setState((prev) => ({
      ...prev,
      refunds: [r, ...prev.refunds],
    }));
  }, []);

  const addSampleData = useCallback(() => {
    const seed = generateSeedData();
    setState(seed);
  }, []);

  return {
    state,
    updateState,
    addTransaction,
    updateTransaction,
    addCustomer,
    addSubscription,
    updateSubscription,
    addInvoice,
    addCoupon,
    addPaymentLink,
    addProvider,
    connectWallet,
    addWebhook,
    addRefund,
    addSampleData,
  };
}
