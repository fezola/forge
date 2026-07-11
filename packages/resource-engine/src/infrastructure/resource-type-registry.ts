import { Injectable } from '@nestjs/common';
import type { ResourceTypeDefinition } from '@forge/resource-types';
import type { IResourceTypeRepository } from '../domain/resource-interfaces';

@Injectable()
export class ResourceTypeRegistry implements IResourceTypeRepository {
  private types = new Map<string, ResourceTypeDefinition>();

  register(type: ResourceTypeDefinition): void {
    this.types.set(type.type, type);
  }

  get(type: string): ResourceTypeDefinition | undefined {
    return this.types.get(type);
  }

  getAll(): ResourceTypeDefinition[] {
    return Array.from(this.types.values());
  }
}