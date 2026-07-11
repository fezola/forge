import { IAuthProvider, IdentityProvider, AuthCredentials, AuthProviderResult } from '@forge/identity-types';

export interface IAuthProviderRegistry {
  register(provider: IAuthProvider): void;
  get(type: IdentityProvider): IAuthProvider | null;
  getAll(): IAuthProvider[];
  authenticate(type: IdentityProvider, credentials: AuthCredentials): Promise<AuthProviderResult>;
  verify(type: IdentityProvider, token: string): Promise<AuthProviderResult>;
  link(existingIdentityId: string, type: IdentityProvider, credentials: AuthCredentials): Promise<AuthProviderResult>;
  unlink(identityId: string, type: IdentityProvider): Promise<void>;
}