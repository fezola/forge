import { Injectable } from '@nestjs/common';
import { IAuthProvider, IdentityProvider, AuthCredentials, AuthProviderResult } from '@forge/identity-types';

@Injectable()
export class EmailPasswordProvider implements IAuthProvider {
  readonly type: IdentityProvider = 'email';
  readonly displayName = 'Email & Password';

  async authenticate(credentials: AuthCredentials): Promise<AuthProviderResult> {
    if (credentials.type !== 'email_password') {
      throw new Error('Invalid credential type for EmailPasswordProvider');
    }
    return {
      identityId: '',
      provider: 'email',
      providerUserId: credentials.email,
      email: credentials.email,
      displayName: credentials.email.split('@')[0],
      isNewProvider: true,
    };
  }

  async verify(_token: string): Promise<AuthProviderResult> {
    throw new Error('EmailPasswordProvider does not support token verification — use MagicLinkProvider');
  }

  async link(existingIdentityId: string, credentials: AuthCredentials): Promise<AuthProviderResult> {
    if (credentials.type !== 'email_password') throw new Error('Invalid credential type');
    return {
      identityId: existingIdentityId,
      provider: 'email',
      providerUserId: credentials.email,
      email: credentials.email,
      isNewProvider: true,
    };
  }

  async unlink(_identityId: string): Promise<void> {
    // No-op: provider links are managed by the IdentityRepository
  }
}