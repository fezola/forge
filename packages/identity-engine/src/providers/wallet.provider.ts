import { Injectable } from '@nestjs/common';
import { IAuthProvider, IdentityProvider, AuthCredentials, AuthProviderResult } from '@forge/identity-types';

@Injectable()
export class WalletProvider implements IAuthProvider {
  readonly type: IdentityProvider = 'wallet';
  readonly displayName = 'Wallet / Web3';

  async authenticate(credentials: AuthCredentials): Promise<AuthProviderResult> {
    if (credentials.type !== 'wallet_signature') throw new Error('Invalid credential type for WalletProvider');
    // TODO: Verify wallet signature using the message + signature against the wallet address
    return {
      identityId: '',
      provider: 'wallet',
      providerUserId: credentials.walletAddress,
      displayName: credentials.walletAddress.slice(0, 8) + '...' + credentials.walletAddress.slice(-4),
      metadata: { chain: credentials.chain },
      isNewProvider: true,
    };
  }

  async verify(_token: string): Promise<AuthProviderResult> {
    throw new Error('WalletProvider does not support token verification');
  }

  async link(existingIdentityId: string, credentials: AuthCredentials): Promise<AuthProviderResult> {
    if (credentials.type !== 'wallet_signature') throw new Error('Invalid credential type');
    return {
      identityId: existingIdentityId,
      provider: 'wallet',
      providerUserId: credentials.walletAddress,
      metadata: { chain: credentials.chain },
      isNewProvider: true,
    };
  }

  async unlink(_identityId: string): Promise<void> {
    // No-op
  }
}