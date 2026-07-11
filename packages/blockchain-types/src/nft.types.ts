export interface NFTSync {
  id: string;
  projectId: string;
  chainSlug: string;
  contractAddress?: string | null;
  identityId?: string | null;
  type: NFTSyncType;
  data: Record<string, unknown>;
  txHash?: string | null;
  syncedAt: string;
  metadata?: Record<string, unknown> | null;
}

export type NFTSyncType = 'nft' | 'token' | 'collection' | 'metadata';
