import React from 'react';
import { cn } from '../../utils/cn';
import { ForgeComponentConfig } from '../../types/component.types';
import { useForgeData } from '../../hooks/use-forge-data';
import { ForgeBadge } from '../ui/forge-badge';
import { ForgeLoading } from '../ui/forge-loading';

export interface ForgePaymentStatusProps extends ForgeComponentConfig {
  transactionId?: string;
  sourceType?: string;
  sourceConfig?: Record<string, unknown>;
  className?: string;
}

export function ForgePaymentStatus({
  transactionId,
  sourceType = 'connector.action',
  sourceConfig = {},
  className,
  ...forgeConfig
}: ForgePaymentStatusProps) {
  const { data, loading } = useForgeData(forgeConfig, {
    sourceType,
    sourceConfig: { ...sourceConfig, transactionId },
  });

  if (loading) return <ForgeLoading {...forgeConfig} />;

  const status = (data as string) || 'pending';
  const variant = status === 'completed' ? 'success' : status === 'failed' ? 'danger' : 'warning';

  return <ForgeBadge variant={variant} className={className}>{status}</ForgeBadge>;
}
