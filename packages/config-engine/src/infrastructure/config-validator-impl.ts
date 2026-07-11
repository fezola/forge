import { Injectable } from '@nestjs/common';
import type { ConfigFieldDefinition, ConfigValueType, ValidationResult, ValidationError, ValidationWarning } from '@forge/config-types';
import { IConfigValidator } from '../domain/config-validator.interface';

@Injectable()
export class ConfigValidatorImpl implements IConfigValidator {
  async validateValue(field: ConfigFieldDefinition, value: unknown): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const v = this;

    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push({ field: field.key, message: `${field.label} is required`, code: 'REQUIRED' });
      return { valid: false, errors, warnings };
    }

    if (value === undefined || value === null || value === '') {
      return { valid: true, errors, warnings };
    }

    if (!v.validateType(value, field.type)) {
      errors.push({ field: field.key, message: `Expected type '${field.type}'`, code: 'TYPE_MISMATCH' });
    }

    if (field.validation) {
      for (const rule of field.validation) {
        const strValue = String(value);
        switch (rule.type) {
          case 'min_length':
            if (strValue.length < Number(rule.value)) {
              errors.push({ field: field.key, message: rule.message || `Minimum length is ${rule.value}`, code: 'MIN_LENGTH' });
            }
            break;
          case 'max_length':
            if (strValue.length > Number(rule.value)) {
              errors.push({ field: field.key, message: rule.message || `Maximum length is ${rule.value}`, code: 'MAX_LENGTH' });
            }
            break;
          case 'regex':
            if (rule.value && !new RegExp(String(rule.value)).test(strValue)) {
              errors.push({ field: field.key, message: rule.message || 'Invalid format', code: 'REGEX' });
            }
            break;
          case 'range':
            if (field.type === 'number') {
              const num = Number(value);
              const parts = String(rule.value).split(',');
              if (parts.length === 2) {
                const min = Number(parts[0]);
                const max = Number(parts[1]);
                if (num < min || num > max) {
                  errors.push({ field: field.key, message: rule.message || `Value must be between ${min} and ${max}`, code: 'RANGE' });
                }
              }
            }
            break;
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateType(value: unknown, type: ConfigValueType): boolean {
    switch (type) {
      case 'string':
      case 'secret':
      case 'url':
      case 'email':
      case 'host':
      case 'color':
      case 'image_url':
      case 'markdown':
        return typeof value === 'string';
      case 'number':
      case 'port':
        return typeof value === 'number' || !isNaN(Number(value));
      case 'boolean':
        return typeof value === 'boolean' || value === 'true' || value === 'false';
      case 'json':
        try {
          if (typeof value === 'string') { JSON.parse(value); return true; }
          return typeof value === 'object';
        } catch { return false; }
      case 'select':
        return typeof value === 'string';
      case 'multi_select':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  async validateConnection(type: string, _config: Record<string, unknown>): Promise<ValidationResult> {
    // Connection validation is provider-specific and will be implemented per connector.
    // This stub returns a successful result for now.
    return { valid: true, errors: [], warnings: [{ field: '_connection', message: `Connection test not implemented for '${type}'`, code: 'TEST_NOT_IMPLEMENTED' }] };
  }
}