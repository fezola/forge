import React, { useState } from 'react';
import { ForgeComponentConfig } from '../../types/component.types';
import { ForgeButton } from '../ui/forge-button';

export interface ForgeWalletConnectProps extends ForgeComponentConfig {
  network?: string;
  label?: string;
  connectedLabel?: string;
  className?: string;
}

export function ForgeWalletConnect({
  network = 'solana',
  label = 'Connect Wallet',
  connectedLabel = 'Connected',
  className,
  ...forgeConfig
}: ForgeWalletConnectProps) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      setConnected(true);
      setAddress('...');
      if (forgeConfig.onEvent) forgeConfig.onEvent('wallet_connected', { network, address });
    } catch (e: any) {
      if (forgeConfig.onEvent) forgeConfig.onEvent('error', e);
    } finally {
      setLoading(false);
    }
  };

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-sm text-muted-foreground">{connectedLabel}</span>
        {address && <code className="text-xs text-muted-foreground">{address.slice(0, 4)}...{address.slice(-4)}</code>}
      </div>
    );
  }

  return <ForgeButton {...forgeConfig} loading={loading} onClick={handleConnect} className={className}>{label}</ForgeButton>;
}
