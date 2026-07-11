import { Injectable, Logger } from '@nestjs/common';
import type { IStorageProvider } from '@forge/storage-types';
import type { IStorageProviderRegistryPort } from '../../domain/storage-interfaces';

@Injectable()
export class StorageProviderRegistry implements IStorageProviderRegistryPort {
  private readonly logger = new Logger(StorageProviderRegistry.name);
  private providers = new Map<string, IStorageProvider>();

  register(provider: IStorageProvider): void {
    this.providers.set(provider.type, provider);
    this.logger.log(`Storage provider registered: ${provider.type}`);
  }

  get(type: string): IStorageProvider | undefined {
    return this.providers.get(type);
  }

  getAll(): IStorageProvider[] {
    return Array.from(this.providers.values());
  }

  async getForProject(_projectId: string): Promise<IStorageProvider[]> {
    return this.getAll();
  }

  getDefault(): IStorageProvider | undefined {
    return this.providers.get('forge_managed') || this.providers.values().next().value;
  }
}