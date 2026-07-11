import { useMemo, useCallback } from "react";
import { PaymentProcessor, type CreatePaymentInput, type IssueRefundInput } from "../lib/paymentProcessor";
import { providerFactory } from "../lib/providerFactory";
import { eventBus } from "../lib/eventBus";
import type { PaymentSource } from "../types/providers";
import type { PaymentTransaction } from "../types/payments";

interface UsePaymentProcessorOptions {
  providerId?: string;
  onTransactionCreated?: (txn: PaymentTransaction) => void;
  onTransactionFailed?: (txn: PaymentTransaction, error: string) => void;
  onRefundCreated?: (refund: any, txn: PaymentTransaction) => void;
}

export function usePaymentProcessor(options: UsePaymentProcessorOptions = {}) {
  const processor = useMemo(() => {
    const adapter = options.providerId
      ? providerFactory.get(options.providerId)
      : providerFactory.get("mock");
    return new PaymentProcessor(adapter || providerFactory.get("mock")!);
  }, [options.providerId]);

  const processPayment = useCallback(
    async (
      input: Omit<CreatePaymentInput, "source"> & {
        paymentMethodType?: PaymentSource["type"];
        cardLast4?: string;
      }
    ): Promise<PaymentTransaction | null> => {
      const source: PaymentSource = {
        type: input.paymentMethodType || "card",
        cardLast4: input.cardLast4 || "4242",
      };

      const result = await processor.process({
        ...input,
        source,
      });

      if (result.success && result.transaction) {
        options.onTransactionCreated?.(result.transaction);
        return result.transaction;
      }

      if (result.transaction) {
        options.onTransactionFailed?.(result.transaction, result.error || "Unknown error");
      }

      return null;
    },
    [processor, options]
  );

  const issueRefund = useCallback(
    async (input: IssueRefundInput, transactions: PaymentTransaction[]) => {
      const result = await processor.refund(input, transactions);
      if (result.success && result.refund && result.transaction) {
        options.onRefundCreated?.(result.refund, result.transaction);
      }
      return result;
    },
    [processor, options]
  );

  const getMetrics = useCallback(() => processor.getMetrics(), [processor]);

  return {
    processor,
    processPayment,
    issueRefund,
    getMetrics,
  };
}

export { eventBus, providerFactory };
