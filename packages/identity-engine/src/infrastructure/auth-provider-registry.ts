import { Injectable } from '@nestjs/common';
import { IAuthProvider, IdentityProvider, AuthCredentials, AuthProviderResult } from '@forge/identity-types';
import { IAuthProviderRegistry } from '../domain/auth-provider-registry.interface';

@Injectable()
export class AuthProviderRegistry implements IAuthProviderRegistry {
  private readonly providers = new Map<IdentityProvider, IAuthProvider>();

  register(provider: IAuthProvider): void {
    this.providers.set(provider.type, provider);
  }

  get(type: IdentityProvider): IAuthProvider | null {
    return this.providers.get(type) ?? null;
  }

  getAll(): IAuthProvider[] {
    return Array.from(this.providers.values());
  }

  async authenticate(type: IdentityProvider, credentials: AuthCredentials): Promise<AuthProviderResult> {
    const provider = this.get(type);
    if (!provider) throw new Error(`Auth provider '${type}' is not registered`);
    return provider.authenticate(credentials);
  }

  async verify(type: IdentityProvider, token: string): Promise<AuthProviderResult> {
    const provider = this.get(type);
    if (!provider) throw new Error(`Auth provider '${type}' is not registered`);
    return provider.verify(token);
  }

  async link(existingIdentityId: string, type: IdentityProvider, credentials: AuthCredentials): Promise<AuthProviderResult> {
    const provider = this.get(type);
    if (!provider) throw new Error(`Auth provider '${type}' is not registered`);
    return provider.link(existingIdentityId, credentials);
  }

  async unlink(identityId: string, type: IdentityProvider): Promise<void> {
    const provider = this.get(type);
    if (!provider) throw new Error(`Auth provider '${type}' is not registered`);
    return provider.unlink(identityId);
  }
}