import { Injectable } from '@nestjs/common';
import { IAuthProvider, IdentityProvider, AuthCredentials, AuthProviderResult } from '@forge/identity-types';

@Injectable()
export class PasskeyProvider implements IAuthProvider {
  readonly type: IdentityProvider = 'passkey';
  readonly displayName = 'Passkey';

  async authenticate(credentials: AuthCredentials): Promise<AuthProviderResult> {
    if (credentials.type !== 'passkey') throw new Error('Invalid credential type for PasskeyProvider');
    // TODO: Verify passkey signature against stored public key credential
    return {
      identityId: '',
      provider: 'passkey',
      providerUserId: credentials.credentialId,
      metadata: { authenticatorData: credentials.authenticatorData },
      isNewProvider: true,
    };
  }

  async verify(_token: string): Promise<AuthProviderResult> {
    throw new Error('PasskeyProvider does not support token verification');
  }

  async link(existingIdentityId: string, credentials: AuthCredentials): Promise<AuthProviderResult> {
    if (credentials.type !== 'passkey') throw new Error('Invalid credential type');
    return {
      identityId: existingIdentityId,
      provider: 'passkey',
      providerUserId: credentials.credentialId,
      isNewProvider: true,
    };
  }

  async unlink(_identityId: string): Promise<void> {
    // No-op
  }
}