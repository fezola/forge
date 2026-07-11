import { Injectable, Inject } from '@nestjs/common';
import type { ValidationResult, ConfigFieldDefinition, ConfigValueType } from '@forge/config-types';
import { IConfigValidator } from '../domain/config-validator.interface';

@Injectable()
export class ValidationService implements IConfigValidator {
  constructor(
    @Inject(IConfigValidator) private readonly delegate: IConfigValidator,
  ) {}

  async validateValue(field: ConfigFieldDefinition, value: unknown): Promise<ValidationResult> {
    return this.delegate.validateValue(field, value);
  }

  validateType(value: unknown, type: ConfigValueType): boolean {
    return this.delegate.validateType(value, type);
  }

  async validateConnection(type: string, config: Record<string, unknown>): Promise<ValidationResult> {
    return this.delegate.validateConnection(type, config);
  }
}