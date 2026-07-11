import { WalletChain } from './identity.types';

export interface Wallet {
  id: string;
  identityId: string;
  address: string;
  chain: WalletChain;
  label: string | null;
  isPrimary: boolean;
  isEmbedded: boolean;
  provider: WalletProvider;
  publicKey: string | null;
  verifiedAt: string;
  lastVerifiedAt: string | null;
  createdAt: string;
}

export type WalletProvider = 'phantom' | 'solflare' | 'metamask' | 'walletconnect' | 'coinbase' | 'embedded' | 'smart_wallet';

export interface LinkWalletRequest {
  identityId: string;
  address: string;
  chain: WalletChain;
  provider: WalletProvider;
  signature: string;
  message: string;
  label?: string;
  isPrimary?: boolean;
  publicKey?: string;
}

export interface EmbeddedWallet {
  id: string;
  identityId: string;
  address: string;
  chain: WalletChain;
  encryptedPrivateKey: string;
  encryptionSalt: string;
  recoveryMethod: RecoveryMethod[];
  createdAt: string;
  lastUsedAt: string | null;
}

export type RecoveryMethod = 'social_recovery' | 'passkey' | 'recovery_codes' | 'guardian_account' | 'backup_phrase';

export interface IWalletRepository {
  findById(id: string): Promise<Wallet | null>;
  findByIdentity(identityId: string): Promise<Wallet[]>;
  findByAddress(address: string, chain: WalletChain): Promise<Wallet | null>;
  link(request: LinkWalletRequest): Promise<Wallet>;
  unlink(id: string): Promise<void>;
  setPrimary(id: string, identityId: string): Promise<void>;
  verify(id: string): Promise<void>;
  getEmbedded(identityId: string): Promise<EmbeddedWallet | null>;
  createEmbedded(identityId: string, wallet: Omit<EmbeddedWallet, 'id' | 'createdAt' | 'lastUsedAt'>): Promise<EmbeddedWallet>;
}