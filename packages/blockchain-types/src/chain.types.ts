export interface Chain {
  id: string;
  name: string;
  slug: string;
  chainId: number;
  network: string;
  rpcUrl?: string | null;
  explorerUrl?: string | null;
  symbol: string;
  decimals: number;
  enabled: boolean;
  sortOrder: number;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type ChainNetwork = 'mainnet' | 'testnet' | 'devnet' | 'local';
