import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { Secret, CreateSecretInput, RotateSecretInput, SecretRotationPolicy, SecretAccessLog } from '@forge/config-types';
import { ISecretStore } from '../domain/secret-store.interface';

function toSecret(row: any): Secret {
  return {
    id: row.id,
    configId: row.configId,
    encryptionAlgorithm: row.encryptionAlgorithm,
    keyVersion: row.keyVersion,
    encryptedValue: row.encryptedValue,
    iv: row.iv,
    authTag: row.authTag ?? undefined,
    hint: row.hint ?? undefined,
    status: row.status,
    expiresAt: row.expiresAt?.toISOString() ?? undefined,
    rotatedAt: row.rotatedAt?.toISOString() ?? undefined,
    rotatedFromId: row.rotatedFromId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
  };
}

@Injectable()
export class PrismaSecretStore implements ISecretStore {
  constructor(private readonly prisma: PrismaClient) {}

  async store(input: CreateSecretInput & { id: string; createdBy: string }): Promise<Secret> {
    const row = await this.prisma.secret.create({
      data: {
        id: input.id,
        configId: input.configId,
        encryptedValue: input.value,
        encryptionAlgorithm: input.algorithm ?? 'aes-256-gcm',
        iv: input.iv ?? '',
        authTag: input.authTag,
        keyVersion: input.keyVersion ?? 1,
        hint: input.hint,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        createdBy: input.createdBy,
      },
    });
    return toSecret(row);
  }

  async getById(id: string): Promise<Secret | null> {
    const row = await this.prisma.secret.findUnique({ where: { id } });
    return row ? toSecret(row) : null;
  }

  async getByConfig(configId: string): Promise<Secret | null> {
    const row = await this.prisma.secret.findFirst({
      where: { configId },
      orderBy: { createdAt: 'desc' },
    });
    return row ? toSecret(row) : null;
  }

  async getActiveByConfig(configId: string): Promise<Secret | null> {
    const row = await this.prisma.secret.findFirst({
      where: { configId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    return row ? toSecret(row) : null;
  }

  async rotate(secretId: string, input: RotateSecretInput & { rotatedBy: string }): Promise<Secret> {
    const old = await this.prisma.secret.findUnique({ where: { id: secretId } });
    if (!old) throw new Error('Secret not found');

    await this.prisma.secret.update({
      where: { id: secretId },
      data: { status: 'rotating' },
    });

    const row = await this.prisma.secret.create({
      data: {
        configId: old.configId,
        encryptedValue: input.newValue,
        encryptionAlgorithm: old.encryptionAlgorithm,
        keyVersion: input.keyVersion ?? old.keyVersion + 1,
        iv: input.iv ?? '',
        authTag: input.authTag,
        status: 'active',
        rotatedFromId: secretId,
        createdBy: input.rotatedBy,
      },
    });

    await this.prisma.secret.update({
      where: { id: secretId },
      data: { status: 'expired', rotatedAt: new Date() },
    });

    return toSecret(row);
  }

  async revoke(secretId: string, _revokedBy: string): Promise<void> {
    await this.prisma.secret.update({
      where: { id: secretId },
      data: { status: 'revoked' },
    });
  }

  async markCompromised(secretId: string): Promise<void> {
    await this.prisma.secret.update({
      where: { id: secretId },
      data: { status: 'compromised' },
    });
  }

  async listExpiring(withinHours: number): Promise<Secret[]> {
    const threshold = new Date(Date.now() + withinHours * 60 * 60 * 1000);
    const rows = await this.prisma.secret.findMany({
      where: {
        status: 'active',
        expiresAt: { not: null, lte: threshold },
      },
    });
    return rows.map(toSecret);
  }

  async logAccess(entry: SecretAccessLog): Promise<void> {
    await this.prisma.secretAccessLog.create({
      data: {
        id: entry.id,
        secretId: entry.secretId,
        configId: entry.configId,
        accessedBy: entry.accessedBy,
        action: entry.action,
        ip: entry.ip,
        userAgent: entry.userAgent,
        timestamp: new Date(entry.timestamp),
      },
    });
  }

  async getRotationPolicy(configId: string): Promise<SecretRotationPolicy | null> {
    const row = await this.prisma.secretRotationPolicy.findUnique({ where: { configId } });
    if (!row) return null;
    return {
      id: row.id,
      configId: row.configId,
      intervalDays: row.intervalDays,
      notifyBeforeDays: row.notifyBeforeDays,
      enabled: row.enabled,
      lastRotatedAt: row.lastRotatedAt?.toISOString() ?? undefined,
      nextRotationAt: row.nextRotationAt?.toISOString() ?? undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async setRotationPolicy(configId: string, policy: Partial<SecretRotationPolicy> & { createdBy: string }): Promise<SecretRotationPolicy> {
    const row = await this.prisma.secretRotationPolicy.upsert({
      where: { configId },
      create: {
        configId,
        intervalDays: policy.intervalDays ?? 90,
        notifyBeforeDays: policy.notifyBeforeDays ?? 7,
        enabled: policy.enabled ?? true,
      },
      update: {
        intervalDays: policy.intervalDays,
        notifyBeforeDays: policy.notifyBeforeDays,
        enabled: policy.enabled,
      },
    });
    return {
      id: row.id,
      configId: row.configId,
      intervalDays: row.intervalDays,
      notifyBeforeDays: row.notifyBeforeDays,
      enabled: row.enabled,
      lastRotatedAt: row.lastRotatedAt?.toISOString() ?? undefined,
      nextRotationAt: row.nextRotationAt?.toISOString() ?? undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}