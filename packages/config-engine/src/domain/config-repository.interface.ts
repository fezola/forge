import type { ConfigEntry, ConfigValue, CreateConfigInput, UpdateConfigInput, SetConfigValueInput, ConfigFilter, ConfigListResult } from '@forge/config-types';

export const IConfigRepository = Symbol('IConfigRepository');

export interface IConfigRepository {
  create(input: CreateConfigInput & { id: string; createdBy: string }): Promise<ConfigEntry>;
  update(id: string, input: UpdateConfigInput & { updatedBy: string }): Promise<ConfigEntry>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<ConfigEntry | null>;
  findByKey(key: string, projectId?: string, organizationId?: string): Promise<ConfigEntry | null>;
  find(filter: ConfigFilter): Promise<ConfigListResult>;
  setValue(configId: string, input: SetConfigValueInput & { createdBy: string }): Promise<ConfigValue>;
  getValue(configId: string, environmentId: string): Promise<ConfigValue | null>;
  getValues(configId: string): Promise<ConfigValue[]>;
  deleteValue(id: string): Promise<void>;
  getActiveValue(configId: string, environmentId: string): Promise<ConfigValue | null>;
}