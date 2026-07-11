export interface Wallet {
  id: string;
  address: string;
  chainSlug: string;
  chainId?: number | null;
  identityId?: string | null;
  organizationId?: string | null;
  label?: string | null;
  isPrimary: boolean;
  balance?: string | null;
  tokenBalance?: Record<string, unknown> | null;
  lastSyncedAt?: string | null;
  verified: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface LinkWalletRequest {
  address: string;
  chainSlug?: string;
  chainId?: number;
  label?: string;
  signature: string;
  message: string;
}
