export interface Transaction {
  id: string;
  hash: string;
  chainId: string;
  projectId?: string | null;
  contractId?: string | null;
  fromAddress: string;
  toAddress: string;
  value?: string | null;
  data?: string | null;
  gasLimit?: string | null;
  gasUsed?: string | null;
  gasPrice?: string | null;
  nonce?: number | null;
  status: TransactionStatus;
  blockNumber?: number | null;
  timestamp?: string | null;
  confirmations: number;
  methodSignature?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'reverted' | 'dropped';

export interface SendTransactionRequest {
  chainId: string;
  projectId: string;
  toAddress: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
}
