import type { Transaction, TransactionStatus } from '@forge/blockchain-types';

export interface IBlockchainProvider {
  readonly chainSlug: string;
  getBalance(address: string): Promise<string>;
  getTransaction(hash: string): Promise<Transaction | null>;
  sendTransaction(data: { from: string; to: string; value?: string; data?: string; gasLimit?: string; gasPrice?: string }): Promise<string>;
  estimateGas(data: { from: string; to: string; value?: string; data?: string }): Promise<string>;
  getBlockNumber(): Promise<number>;
  verifyMessage(message: string, signature: string, address: string): Promise<boolean>;
  call(data: { to: string; data: string }): Promise<string>;
  getTokenBalance(account: string, tokenAddress: string): Promise<string>;
  getTransactionStatus(hash: string): Promise<TransactionStatus>;
}
