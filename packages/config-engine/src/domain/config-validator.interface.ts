import type { ConfigFieldDefinition, ConfigValueType, ValidationResult } from '@forge/config-types';

export const IConfigValidator = Symbol('IConfigValidator');

export interface IConfigValidator {
  validateValue(field: ConfigFieldDefinition, value: unknown): Promise<ValidationResult>;
  validateType(value: unknown, type: ConfigValueType): boolean;
  validateConnection(type: string, config: Record<string, unknown>): Promise<ValidationResult>;
}