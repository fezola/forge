import type { Secret, CreateSecretInput, RotateSecretInput, SecretRotationPolicy, SecretAccessLog } from '@forge/config-types';

export const ISecretStore = Symbol('ISecretStore');

export interface ISecretStore {
  store(input: CreateSecretInput & { id: string; createdBy: string }): Promise<Secret>;
  getById(id: string): Promise<Secret | null>;
  getByConfig(configId: string): Promise<Secret | null>;
  getActiveByConfig(configId: string): Promise<Secret | null>;
  rotate(secretId: string, input: RotateSecretInput & { rotatedBy: string }): Promise<Secret>;
  revoke(secretId: string, revokedBy: string): Promise<void>;
  markCompromised(secretId: string): Promise<void>;
  listExpiring(withinHours: number): Promise<Secret[]>;
  logAccess(entry: SecretAccessLog): Promise<void>;
  getRotationPolicy(configId: string): Promise<SecretRotationPolicy | null>;
  setRotationPolicy(configId: string, policy: Partial<SecretRotationPolicy> & { createdBy: string }): Promise<SecretRotationPolicy>;
}