import { Injectable } from '@nestjs/common';
import { VARIABLE_PATTERN } from '@forge/workflow-types';
import { SecretManagerService } from '@forge/secret-manager';

@Injectable()
export class VariableResolverService {
  constructor(private readonly secrets: SecretManagerService) {}

  async resolve(
    input: Record<string, unknown>,
    context: Record<string, unknown>,
    projectId: string,
  ): Promise<Record<string, unknown>> {
    const secrets = await this.secrets.resolveForExecution(projectId);
    const fullContext = { ...context, secrets };

    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      resolved[key] = this.resolveValue(value, fullContext);
    }
    return resolved;
  }

  resolveString(template: string, context: Record<string, unknown>): string {
    return template.replace(VARIABLE_PATTERN, (_, path) => {
      return this.getDeepValue(context, path);
    });
  }

  private resolveValue(value: unknown, context: Record<string, unknown>): unknown {
    if (typeof value === 'string' && VARIABLE_PATTERN.test(value)) {
      VARIABLE_PATTERN.lastIndex = 0;
      return this.resolveString(value, context);
    }
    if (Array.isArray(value)) {
      return value.map(v => this.resolveValue(v, context));
    }
    if (typeof value === 'object' && value !== null) {
      const obj: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        obj[k] = this.resolveValue(v, context);
      }
      return obj;
    }
    return value;
  }

  private getDeepValue(obj: Record<string, unknown>, path: string): string {
    const parts = path.split('.');
    let current: unknown = obj;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return `{{${path}}}`;
      }
      current = (current as Record<string, unknown>)[part];
    }
    return current !== undefined ? String(current) : `{{${path}}}`;
  }
}
