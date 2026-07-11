export type IdentityStatus = 'active' | 'disabled' | 'suspended' | 'pending_verification';

export type IdentityProvider = 'email' | 'google' | 'github' | 'apple' | 'microsoft' | 'discord' | 'x' | 'saml' | 'oidc' | 'wallet' | 'passkey';

export type WalletChain = 'solana' | 'ethereum' | 'polygon' | 'base' | 'bitcoin';

export interface ForgeIdentity {
  id: string;
  projectId: string;
  displayName: string;
  primaryEmail: string | null;
  primaryPhone: string | null;
  avatarUrl: string | null;
  status: IdentityStatus;
  verifiedEmails: string[];
  verifiedPhones: string[];
  providers: IdentityProvider[];
  wallets: string[];
  organizations: string[];
  defaultOrganizationId: string | null;
  roles: string[];
  permissions: string[];
  metadata: Record<string, unknown>;
  settings: IdentitySettings;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface IdentitySettings {
  preferredLanguage: string;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  country: string;
  notifications: Record<string, boolean>;
  privacy: Record<string, unknown>;
}

export interface CreateIdentityRequest {
  projectId: string;
  displayName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
  settings?: Partial<IdentitySettings>;
}

export interface UpdateIdentity {
  displayName?: string;
  avatarUrl?: string;
  status?: IdentityStatus;
  metadata?: Record<string, unknown>;
  settings?: Partial<IdentitySettings>;
}

export interface IdentitySummary {
  id: string;
  displayName: string;
  primaryEmail: string | null;
  avatarUrl: string | null;
  status: IdentityStatus;
  providerCount: number;
  walletCount: number;
  lastLoginAt: string | null;
}

export type AuthMethod = 'password' | 'otp' | 'magic_link' | 'oauth' | 'wallet_signature' | 'passkey' | 'saml' | 'oidc';

export interface AuthResult {
  identity: ForgeIdentity;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  sessionId: string;
  isNewUser: boolean;
  linkedProviders: IdentityProvider[];
}

export interface TokenPayload {
  sub: string;
  projectId: string;
  email?: string;
  roles: string[];
  permissions: string[];
  organizationId?: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAgeDays: number;
  preventReuse: number;
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAgeDays: 90,
  preventReuse: 5,
};