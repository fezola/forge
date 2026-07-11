export interface SsoProvider {
  id: string;
  projectId: string;
  name: string;
  provider: SsoProviderType;
  clientId?: string | null;
  clientSecret?: string | null;
  issuer?: string | null;
  authorizeUrl?: string | null;
  tokenUrl?: string | null;
  userInfoUrl?: string | null;
  scopes: string[];
  enabled: boolean;
  autoProvision: boolean;
  defaultRoleId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type SsoProviderType = 'saml' | 'oidc' | 'google' | 'microsoft' | 'github' | 'apple';

export interface SsoDomain {
  id: string;
  providerId: string;
  domain: string;
  verified: boolean;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface SamlConfig {
  id: string;
  providerId: string;
  entityId: string;
  acsUrl: string;
  metadataUrl?: string | null;
  certificate?: string | null;
  privateKey?: string | null;
  signatureAlgorithm: string;
  digestAlgorithm: string;
  nameIdFormat: string;
  attributeMapping?: Record<string, string> | null;
}

export interface OidcConfig {
  id: string;
  providerId: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint?: string | null;
  jwksUri?: string | null;
  logoutEndpoint?: string | null;
  clientId: string;
  clientSecret?: string | null;
  responseType: string;
  grantType: string;
  scopes: string[];
  claimMapping?: Record<string, string> | null;
  pkceEnabled: boolean;
}
