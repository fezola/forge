import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { ISecretRepository } from '../domain/secret.repository.interface';
import { IEncryptionService } from '../domain/encryption.service.interface';

@Injectable()
export class SecretManagerService {
  constructor(
    @Inject('ISecretRepository')
    private readonly repository: ISecretRepository,
    @Inject('IEncryptionService')
    private readonly encryption: IEncryptionService,
  ) {}

  async create(input: { name: string; value: string; provider: string; projectId?: string; connectorId?: string }) {
    const existing = await this.repository.findByName(input.name, input.projectId);
    if (existing) {
      throw new ConflictException(`Secret "${input.name}" already exists`);
    }
    const encryptedValue = await this.encryption.encrypt(input.value);
    return this.repository.create({
      name: input.name,
      encryptedValue,
      provider: input.provider as any,
      projectId: input.projectId,
      connectorId: input.connectorId,
    });
  }

  async get(id: string) {
    const secret = await this.repository.findById(id);
    if (!secret) throw new NotFoundException('Secret not found');
    return {
      ...secret,
      maskedValue: this.maskValue(secret.encryptedValue),
    };
  }

  async list(projectId: string) {
    const secrets = await this.repository.findByProject(projectId);
    return secrets.map(s => ({
      ...s,
      maskedValue: this.maskValue(s.encryptedValue),
    }));
  }

  async update(id: string, value: string) {
    const encryptedValue = await this.encryption.encrypt(value);
    return this.repository.update(id, { encryptedValue } as any);
  }

  async delete(id: string) {
    await this.repository.delete(id);
  }

  async resolveForExecution(projectId: string, connectorId?: string): Promise<Record<string, string>> {
    const secrets = await this.repository.findByProject(projectId);
    const result: Record<string, string> = {};
    for (const secret of secrets) {
      result[secret.name] = await this.encryption.decrypt(secret.encryptedValue);
    }
    if (connectorId) {
      const connectorSecrets = await this.repository.findByConnector(connectorId);
      for (const secret of connectorSecrets) {
        result[secret.name] = await this.encryption.decrypt(secret.encryptedValue);
      }
    }
    return result;
  }

  private maskValue(encrypted: string, visibleChars: number = 4): string {
    if (encrypted.length <= visibleChars + 4) return '****';
    const prefix = encrypted.substring(0, visibleChars);
    const suffix = encrypted.substring(encrypted.length - visibleChars);
    return `${prefix}****${suffix}`;
  }
}
