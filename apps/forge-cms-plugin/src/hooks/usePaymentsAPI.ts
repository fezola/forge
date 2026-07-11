import { useMemo } from "react";
import { PaymentsAPI } from "../api/payments";
import { usePayments } from "./usePayments";

export function usePaymentsAPI() {
  const { state, updateState, addTransaction, updateTransaction, addSubscription, updateSubscription, addInvoice, addRefund, addCustomer } = usePayments();

  const api = useMemo(
    () =>
      new PaymentsAPI({
        getState: () => state,
        setState: (patch: Partial<typeof state>) => {
          updateState(patch);
        },
      }),
    [state]
  );

  return {
    api,
    state,
    addTransaction,
    updateTransaction,
    addSubscription,
    updateSubscription,
    addInvoice,
    addRefund,
    addCustomer,
  };
}
