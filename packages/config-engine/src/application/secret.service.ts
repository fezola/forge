import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { Secret, CreateSecretInput, RotateSecretInput, SecretRotationPolicy } from '@forge/config-types';
import { ConfigError } from '@forge/config-types';
import { ISecretStore } from '../domain/secret-store.interface';
import { IEncryptionService } from '../domain/encryption-service.interface';
import { IConfigAuditLog } from '../domain/config-audit-log.interface';
import { IConfigEventEmitter } from '../domain/config-event-emitter.interface';

@Injectable()
export class SecretService {
  constructor(
    @Inject(ISecretStore) private readonly store: ISecretStore,
    @Inject(IEncryptionService) private readonly encryption: IEncryptionService,
    @Inject(IConfigAuditLog) private readonly audit: IConfigAuditLog,
    @Inject(IConfigEventEmitter) private readonly events: IConfigEventEmitter,
  ) {}

  async create(input: CreateSecretInput, createdBy: string): Promise<Secret> {
    const encrypted = await this.encryption.encrypt(input.value);
    const secret = await this.store.store({
      configId: input.configId,
      value: encrypted.encrypted,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      algorithm: input.algorithm || encrypted.algorithm as any,
      keyVersion: encrypted.keyVersion,
      hint: input.hint || input.value.slice(0, 4) + '****',
      expiresAt: input.expiresAt,
      id: uuid(),
      createdBy,
    });
    await this.store.logAccess({
      id: uuid(), secretId: secret.id, configId: input.configId,
      accessedBy: createdBy, action: 'read', timestamp: new Date().toISOString(),
    });
    await this.audit.log({ id: uuid(), configId: input.configId, action: 'secret.created', actorId: createdBy, timestamp: new Date().toISOString() });
    this.events.emit('secret.created', { configId: input.configId, secretId: secret.id, createdBy });
    return secret;
  }

  async read(secretId: string, accessedBy: string): Promise<string> {
    const secret = await this.store.getById(secretId);
    if (!secret) throw new ConfigError('SECRET_NOT_FOUND', 'Secret not found', 404);
    if (secret.status === 'expired') throw new ConfigError('SECRET_EXPIRED', 'Secret has expired', 403);
    if (secret.status === 'compromised') throw new ConfigError('SECRET_COMPROMISED', 'Secret has been compromised', 403);
    const plaintext = await this.encryption.decrypt({
      encrypted: secret.encryptedValue, iv: secret.iv,
      authTag: secret.authTag, algorithm: secret.encryptionAlgorithm,
      keyVersion: secret.keyVersion,
    });
    await this.store.logAccess({
      id: uuid(), secretId, configId: secret.configId,
      accessedBy, action: 'read', timestamp: new Date().toISOString(),
    });
    this.events.emit('secret.accessed', { secretId, configId: secret.configId, accessedBy });
    return plaintext;
  }

  async rotate(secretId: string, input: RotateSecretInput, rotatedBy: string): Promise<Secret> {
    const secret = await this.store.getById(secretId);
    if (!secret) throw new ConfigError('SECRET_NOT_FOUND', 'Secret not found', 404);
    const encrypted = await this.encryption.encrypt(input.newValue);
    const rotated = await this.store.rotate(secretId, {
      newValue: encrypted.encrypted,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      keyVersion: encrypted.keyVersion,
      reason: input.reason,
      rotatedBy,
    });
    await this.audit.log({ id: uuid(), configId: secret.configId, action: 'secret.rotated', actorId: rotatedBy, details: input.reason, timestamp: new Date().toISOString() });
    this.events.emit('secret.rotated', { secretId, configId: secret.configId, rotatedBy });
    return rotated;
  }

  async revoke(secretId: string, revokedBy: string): Promise<void> {
    const secret = await this.store.getById(secretId);
    if (!secret) throw new ConfigError('SECRET_NOT_FOUND', 'Secret not found', 404);
    await this.store.revoke(secretId, revokedBy);
    await this.audit.log({ id: uuid(), configId: secret.configId, action: 'secret.revoked', actorId: revokedBy, timestamp: new Date().toISOString() });
    this.events.emit('secret.revoked', { secretId, configId: secret.configId, revokedBy });
  }

  async markCompromised(secretId: string): Promise<void> {
    await this.store.markCompromised(secretId);
    const secret = await this.store.getById(secretId);
    if (secret) {
      this.events.emit('secret.compromised', { secretId, configId: secret.configId });
    }
  }

  async getRotationPolicy(configId: string): Promise<SecretRotationPolicy | null> {
    return this.store.getRotationPolicy(configId);
  }

  async setRotationPolicy(configId: string, policy: Partial<SecretRotationPolicy> & { createdBy: string }): Promise<SecretRotationPolicy> {
    return this.store.setRotationPolicy(configId, policy);
  }

  async listExpiring(withinHours: number): Promise<Secret[]> {
    return this.store.listExpiring(withinHours);
  }
}