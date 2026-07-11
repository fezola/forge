import { Injectable, Inject } from '@nestjs/common';
import type { ConfigScope, ConfigScopeType, ResolvedConfigValue } from '@forge/config-types';
import { ConfigError } from '@forge/config-types';
import { IInheritanceResolver } from '../domain/inheritance-resolver.interface';
import { IConfigRepository } from '../domain/config-repository.interface';
import { IEncryptionService } from '../domain/encryption-service.interface';
import { ISecretStore } from '../domain/secret-store.interface';

@Injectable()
export class InheritanceResolverService implements IInheritanceResolver {
  private readonly scopeOrder: ConfigScopeType[] = ['organization', 'project', 'environment', 'connector'];

  constructor(
    @Inject(IConfigRepository) private readonly configRepo: IConfigRepository,
    @Inject(IEncryptionService) private readonly encryption: IEncryptionService,
    @Inject(ISecretStore) private readonly secretStore: ISecretStore,
  ) {}

  async buildChain(_configId: string, scopeType: ConfigScopeType, referenceId: string): Promise<ConfigScope[]> {
    const scopes: ConfigScope[] = [];
    const scopeIndex = this.scopeOrder.indexOf(scopeType);
    if (scopeIndex === -1) throw new ConfigError('CONFIG_INHERITANCE_DEPTH_EXCEEDED', `Unknown scope type '${scopeType}'`, 400);

    for (let i = scopeIndex; i >= 0; i--) {
      scopes.push({
        id: `${this.scopeOrder[i]}-${referenceId}`,
        type: this.scopeOrder[i],
        referenceId: i === scopeIndex ? referenceId : 'inherited',
        parentId: i > 0 ? `${this.scopeOrder[i - 1]}-${referenceId}` : undefined,
        order: this.scopeOrder.length - i,
      });
    }

    if (this.detectCycle(scopes)) {
      throw new ConfigError('CONFIG_INHERITANCE_CYCLE', 'Circular inheritance detected', 400);
    }

    return scopes;
  }

  async resolve(configId: string, environmentId: string): Promise<ResolvedConfigValue> {
    const config = await this.configRepo.findById(configId);
    if (!config) throw new ConfigError('CONFIG_NOT_FOUND', `Config '${configId}' not found`, 404);

    const value = await this.configRepo.getActiveValue(configId, environmentId);
    if (value) {
      const effectiveValue = await this.resolveSecretRefs(value.value);
      return {
        effectiveValue,
        encrypted: value.encrypted,
        sourceScope: { id: `environment-${environmentId}`, type: 'environment', referenceId: environmentId, order: 1 },
        sourceConfigId: configId,
        inherited: false,
        overridden: false,
      };
    }

    const allValues = await this.configRepo.getValues(configId);
    if (allValues.length > 0) {
      const fallback = allValues[0];
      const effectiveValue = await this.resolveSecretRefs(fallback.value);
      return {
        effectiveValue,
        encrypted: fallback.encrypted,
        sourceScope: { id: `environment-${allValues[0].environmentId}`, type: 'environment', referenceId: allValues[0].environmentId, order: 1 },
        sourceConfigId: configId,
        inherited: true,
        overridden: false,
      };
    }

    throw new ConfigError('CONFIG_NOT_FOUND', `No value found for config '${configId}' in any environment`, 404);
  }

  async resolveSecretRef(template: string, _environmentId: string): Promise<string> {
    return this.resolveSecretRefs(template);
  }

  async resolveSecretRefs(value: string): Promise<string> {
    const pattern = /\{\{config\.([^.]+)\.([^}]+)\}\}/g;
    let result = value;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(value)) !== null) {
      const configKey = match[1];
      const field = match[2];
      const config = await this.configRepo.findByKey(configKey);
      if (!config) continue;
      const values = await this.configRepo.getValues(config.id);
      if (field === 'secret' || field === 'key' || field === 'token' || field === 'password') {
        const secret = await this.secretStore.getActiveByConfig(config.id);
        if (secret) {
          const plaintext = await this.encryption.decrypt({
            encrypted: secret.encryptedValue, iv: secret.iv,
            authTag: secret.authTag, algorithm: secret.encryptionAlgorithm,
            keyVersion: secret.keyVersion,
          });
          result = result.replace(match[0], plaintext);
        }
      } else if (values.length > 0) {
        result = result.replace(match[0], values[0].value);
      }
    }

    return result;
  }

  detectCycle(scopes: ConfigScope[]): boolean {
    const visited = new Set<string>();
    for (const scope of scopes) {
      if (visited.has(scope.id)) return true;
      visited.add(scope.id);
    }
    return false;
  }

  async getEffectiveScope(scopeType: ConfigScopeType, referenceId: string): Promise<ConfigScope> {
    return {
      id: `${scopeType}-${referenceId}`,
      type: scopeType,
      referenceId,
      order: this.scopeOrder.indexOf(scopeType) + 1,
    };
  }
}