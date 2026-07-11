import { Injectable, Inject } from '@nestjs/common';
import { IExpressionEvaluator } from '../domain/expression-evaluator.interface';
const Parser = require('expr-eval').Parser;

@Injectable()
export class ExpressionEvaluatorService implements IExpressionEvaluator {
  private parser: any;

  constructor() {
    this.parser = Parser;
  }

  async evaluate(expression: string, context: Record<string, unknown>): Promise<{ value: unknown; error?: string }> {
    try {
      const resolvableExpression = this.injectVariables(expression, context);
      const parsed = this.parser.parse(resolvableExpression);
      const result = parsed.evaluate(context);
      return { value: result };
    } catch (error: any) {
      // Fallback: try simple template string replacement
      try {
        const resolved = expression.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
          return String(this.getDeepValue(context, path.trim()) ?? '');
        });
        return { value: resolved };
      } catch {
        return { value: expression, error: error.message };
      }
    }
  }

  parse(expression: string): { valid: boolean; ast?: string; errors?: string[] } {
    try {
      const parsed = this.parser.parse(expression);
      return { valid: true, ast: JSON.stringify(parsed) };
    } catch (error: any) {
      return { valid: false, errors: [error.message] };
    }
  }

  validate(expression: string): boolean {
    try {
      this.parser.parse(expression);
      return true;
    } catch {
      return false;
    }
  }

  private injectVariables(expr: string, context: Record<string, unknown>): string {
    return expr.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const value = this.getDeepValue(context, path.trim());
      if (typeof value === 'string') return `"${value}"`;
      if (typeof value === 'number') return String(value);
      if (typeof value === 'boolean') return String(value);
      if (value === null || value === undefined) return 'null';
      return String(value);
    });
  }

  private getDeepValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((acc: unknown, part) => {
      if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part];
      return undefined;
    }, obj);
  }
}
