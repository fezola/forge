export type SecretAlgorithm = 'aes-256-gcm' | 'aes-256-cbc' | 'chacha20-poly1305';
export type SecretStatus = 'active' | 'rotating' | 'expired' | 'compromised' | 'revoked';

export interface Secret {
  id: string;
  configId: string;
  encryptionAlgorithm: SecretAlgorithm;
  keyVersion: number;
  encryptedValue: string;
  iv: string;
  authTag?: string;
  hint?: string;
  status: SecretStatus;
  expiresAt?: string;
  rotatedAt?: string;
  rotatedFromId?: string;
  createdAt: string;
  createdBy: string;
}

export interface SecretRotationPolicy {
  id: string;
  configId: string;
  intervalDays: number;
  notifyBeforeDays: number;
  enabled: boolean;
  lastRotatedAt?: string;
  nextRotationAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecretAccessLog {
  id: string;
  secretId: string;
  configId: string;
  accessedBy: string;
  action: 'read' | 'rotated' | 'revoked' | 'expired';
  ip?: string;
  userAgent?: string;
  timestamp: string;
}

export interface CreateSecretInput {
  configId: string;
  value: string;
  algorithm?: SecretAlgorithm;
  iv?: string;
  authTag?: string;
  keyVersion?: number;
  hint?: string;
  expiresAt?: string;
}

export interface RotateSecretInput {
  newValue: string;
  iv?: string;
  authTag?: string;
  keyVersion?: number;
  reason?: string;
}

export interface SecretReference {
  pattern: string;
  configId: string;
  key: string;
  environmentId?: string;
  field: string;
}