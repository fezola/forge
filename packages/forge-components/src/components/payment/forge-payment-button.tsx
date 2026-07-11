import React, { useState } from 'react';
import { ForgeComponentConfig } from '../../types/component.types';
import { ForgeButton } from '../ui/forge-button';

export interface ForgePaymentButtonProps extends ForgeComponentConfig {
  amount?: number;
  currency?: string;
  connectorId?: string;
  label?: string;
  className?: string;
}

export function ForgePaymentButton({
  amount = 0,
  currency = 'USD',
  label = 'Pay Now',
  className,
  ...forgeConfig
}: ForgePaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (forgeConfig.onEvent) forgeConfig.onEvent('success', { amount, currency });
    } catch (e: any) {
      if (forgeConfig.onEvent) forgeConfig.onEvent('error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ForgeButton {...forgeConfig} loading={loading} onClick={handlePayment} className={className}>
      {label} {amount > 0 && `- ${amount} ${currency}`}
    </ForgeButton>
  );
}
