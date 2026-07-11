import type { Chain, Contract, Wallet, Transaction, Web3AuthChallenge, NFTSync } from '@forge/blockchain-types';

export interface IChainRepository {
  findAll(enabledOnly?: boolean): Promise<Chain[]>;
  findById(id: string): Promise<Chain | null>;
  findBySlug(slug: string): Promise<Chain | null>;
  findByChainId(chainId: number): Promise<Chain | null>;
  create(data: { name: string; slug: string; chainId: number; network?: string; rpcUrl?: string; explorerUrl?: string; symbol?: string; decimals?: number; sortOrder?: number }): Promise<Chain>;
  update(id: string, data: Partial<Chain>): Promise<Chain>;
}

export interface IContractRepository {
  findByProject(projectId: string): Promise<Contract[]>;
  findByChain(chainId: string): Promise<Contract[]>;
  findById(id: string): Promise<Contract | null>;
  findByAddress(chainId: string, address: string): Promise<Contract | null>;
  create(data: { chainId: string; projectId: string; address: string; name: string; type?: string; abi?: Record<string, unknown>; deployTxHash?: string; deployedBy?: string; metadata?: Record<string, unknown> }): Promise<Contract>;
  update(id: string, data: Partial<Contract>): Promise<Contract>;
  delete(id: string): Promise<void>;
}

export interface IWalletRepository {
  findByIdentity(identityId: string): Promise<Wallet[]>;
  findByOrganization(organizationId: string): Promise<Wallet[]>;
  findById(id: string): Promise<Wallet | null>;
  findByAddress(address: string, chainSlug: string): Promise<Wallet | null>;
  create(data: { address: string; chainSlug?: string; chainId?: number; identityId?: string; organizationId?: string; label?: string; isPrimary?: boolean; metadata?: Record<string, unknown> }): Promise<Wallet>;
  update(id: string, data: Partial<Wallet>): Promise<Wallet>;
  setPrimary(id: string, identityId: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByHash(hash: string): Promise<Transaction | null>;
  findByProject(projectId: string, limit?: number, offset?: number): Promise<Transaction[]>;
  findByAddress(address: string, limit?: number, offset?: number): Promise<Transaction[]>;
  create(data: { hash: string; chainId: string; projectId?: string; contractId?: string; fromAddress: string; toAddress: string; value?: string; data?: string; gasLimit?: string; gasPrice?: string; nonce?: number; status?: string; methodSignature?: string; metadata?: Record<string, unknown> }): Promise<Transaction>;
  update(id: string, data: Partial<Transaction>): Promise<Transaction>;
  updateByHash(hash: string, data: Partial<Transaction>): Promise<void>;
}

export interface IWeb3AuthRepository {
  findById(id: string): Promise<Web3AuthChallenge | null>;
  findByNonce(nonce: string): Promise<Web3AuthChallenge | null>;
  create(data: { address: string; chainSlug?: string; message: string; nonce: string; expiresAt: Date; ip?: string; userAgent?: string }): Promise<Web3AuthChallenge>;
  complete(id: string, signature: string, identityId: string): Promise<void>;
  cleanupExpired(): Promise<number>;
}

export interface INFTSyncRepository {
  findByProject(projectId: string): Promise<NFTSync[]>;
  findByIdentity(identityId: string): Promise<NFTSync[]>;
  create(data: { projectId: string; chainSlug: string; contractAddress?: string; identityId?: string; type?: string; data: Record<string, unknown>; txHash?: string; metadata?: Record<string, unknown> }): Promise<NFTSync>;
}
