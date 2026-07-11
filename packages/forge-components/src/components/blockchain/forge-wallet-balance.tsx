import React from 'react';
import { cn } from '../../utils/cn';
import { ForgeComponentConfig } from '../../types/component.types';
import { useForgeData } from '../../hooks/use-forge-data';
import { ForgeLoading } from '../ui/forge-loading';

export interface ForgeWalletBalanceProps extends ForgeComponentConfig {
  token?: string;
  symbol?: string;
  decimals?: number;
  address?: string;
  className?: string;
}

export function ForgeWalletBalance({
  token = 'SOL',
  symbol = 'SOL',
  decimals = 9,
  address,
  className,
  ...forgeConfig
}: ForgeWalletBalanceProps) {
  const { data, loading } = useForgeData(forgeConfig, {
    sourceType: 'connector.action',
    sourceConfig: { token, address },
  });

  if (loading) return <ForgeLoading {...forgeConfig} />;

  const balance = data !== null ? Number(data) : 0;
  const formatted = (balance / Math.pow(10, decimals)).toFixed(4);

  return (
    <div className={cn('flex items-baseline gap-1', className)}>
      <span className="text-2xl font-bold">{formatted}</span>
      <span className="text-sm text-muted-foreground">{symbol}</span>
    </div>
  );
}
