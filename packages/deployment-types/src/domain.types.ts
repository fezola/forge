export interface DeploymentDomain {
  id: string;
  environmentId: string;
  domain: string;
  status: 'pending' | 'active' | 'failed' | 'removed';
  sslStatus: 'pending' | 'issuing' | 'issued' | 'failed';
  sslIssuer?: string | null;
  sslExpiresAt?: string | null;
  sslCertificate?: string | null;
  sslPrivateKey?: string | null;
  verified: boolean;
  verificationMethod?: string | null;
  verificationValue?: string | null;
  isPrimary: boolean;
  redirectTo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DomainStatus = 'pending' | 'active' | 'failed' | 'removed';
export type SslStatus = 'pending' | 'issuing' | 'issued' | 'failed';
