import { IdentityProvider, WalletChain } from './identity.types';

export interface AuthProviderConfig {
  type: IdentityProvider;
  enabled: boolean;
  order: number;
  displayName: string;
  iconUrl?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scopes?: string[];
  additionalConfig?: Record<string, unknown>;
}

export interface IAuthProvider {
  readonly type: IdentityProvider;
  readonly displayName: string;
  authenticate(credentials: AuthCredentials): Promise<AuthProviderResult>;
  verify(token: string): Promise<AuthProviderResult>;
  link(existingIdentityId: string, credentials: AuthCredentials): Promise<AuthProviderResult>;
  unlink(identityId: string): Promise<void>;
}

export type AuthCredentials =
  | EmailPasswordCredentials
  | OAuthCredentials
  | WalletSignatureCredentials
  | PasskeyCredentials
  | MagicLinkCredentials
  | OtpCredentials
  | SamlCredentials
  | OidcCredentials;

export interface EmailPasswordCredentials {
  type: 'email_password';
  email: string;
  password: string;
}

export interface OAuthCredentials {
  type: 'oauth';
  provider: IdentityProvider;
  code: string;
  redirectUri: string;
}

export interface WalletSignatureCredentials {
  type: 'wallet_signature';
  walletAddress: string;
  chain: WalletChain;
  signature: string;
  message: string;
}

export interface PasskeyCredentials {
  type: 'passkey';
  credentialId: string;
  authenticatorData: string;
  clientDataJSON: string;
  signature: string;
}

export interface MagicLinkCredentials {
  type: 'magic_link';
  token: string;
}

export interface OtpCredentials {
  type: 'otp';
  code: string;
  channel: 'email' | 'sms';
  identifier: string;
}

export interface SamlCredentials {
  type: 'saml';
  samlResponse: string;
  providerId: string;
}

export interface OidcCredentials {
  type: 'oidc';
  idToken: string;
  providerId: string;
}

export interface AuthProviderResult {
  identityId: string;
  provider: IdentityProvider;
  providerUserId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
  isNewProvider: boolean;
}

export interface AuthProviderRegistration {
  type: IdentityProvider;
  provider: IAuthProvider;
  enabled: boolean;
  order: number;
}