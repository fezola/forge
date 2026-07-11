export type ExpressionOp =
  | 'literal'
  | 'variable'
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'modulo'
  | 'concat'
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'and'
  | 'or'
  | 'not'
  | 'ternary'
  | 'member'
  | 'call';

export interface ExpressionNode {
  op: ExpressionOp;
  left?: ExpressionNode;
  right?: ExpressionNode;
  value?: unknown;
  name?: string;
  args?: ExpressionNode[];
}

export interface Formula {
  id: string;
  source: string;
  ast: ExpressionNode;
}

export interface ParseResult {
  valid: boolean;
  ast?: ExpressionNode;
  errors?: string[];
}

export interface ComputedField {
  name: string;
  formula: string;
  type: 'string' | 'number' | 'boolean';
}
