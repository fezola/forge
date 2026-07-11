import { useState, useEffect } from 'react';
import { Wallet } from '@forge/identity-types';
import { useIdentity } from './use-identity';

export function useWallets() {
  const { client } = useIdentity();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    client.getWallets()
      .then(setWallets)
      .catch(() => setWallets([]))
      .finally(() => setIsLoading(false));
  }, [client]);

  return { wallets, isLoading };
}