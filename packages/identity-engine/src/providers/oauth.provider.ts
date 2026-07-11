import { Injectable } from '@nestjs/common';
import { IAuthProvider } from '@forge/identity-types';
import type { IdentityProvider, AuthCredentials, AuthProviderResult } from '@forge/identity-types';

@Injectable()
export class OAuthProvider implements IAuthProvider {
  readonly type: IdentityProvider;
  readonly displayName: string;

  constructor(readonly providerType: IdentityProvider, displayName?: string) {
    this.type = providerType;
    this.displayName = displayName ?? providerType.charAt(0).toUpperCase() + providerType.slice(1);
  }

  async authenticate(credentials: AuthCredentials): Promise<AuthProviderResult> {
    if (credentials.type !== 'oauth') throw new Error('Invalid credential type for OAuthProvider');
    if (credentials.provider !== this.type) throw new Error(`This provider handles ${this.type}, not ${credentials.provider}`);
    // TODO: Exchange authorization code for access token, then fetch user info
    return {
      identityId: '',
      provider: this.type,
      providerUserId: `${this.type}_user_placeholder`,
      email: undefined,
      displayName: undefined,
      avatarUrl: undefined,
      isNewProvider: true,
    };
  }

  async verify(_token: string): Promise<AuthProviderResult> {
    // TODO: Verify OAuth ID token (JWT from the OIDC provider)
    throw new Error('Not implemented — ID token verification requires provider-specific JWT validation');
  }

  async link(existingIdentityId: string, credentials: AuthCredentials): Promise<AuthProviderResult> {
    if (credentials.type !== 'oauth') throw new Error('Invalid credential type');
    return {
      identityId: existingIdentityId,
      provider: this.type,
      providerUserId: `${this.type}_user_placeholder`,
      isNewProvider: true,
    };
  }

  async unlink(_identityId: string): Promise<void> {
    // No-op
  }
}