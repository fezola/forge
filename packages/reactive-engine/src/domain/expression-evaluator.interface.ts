export interface IExpressionEvaluator {
  evaluate(expression: string, context: Record<string, unknown>): Promise<{ value: unknown; error?: string }>;
  parse(expression: string): { valid: boolean; ast?: string; errors?: string[] };
  validate(expression: string): boolean;
}
