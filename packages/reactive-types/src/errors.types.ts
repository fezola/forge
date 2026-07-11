export class ReactiveError extends Error {
  constructor(
    message: string,
    public readonly code: ReactiveErrorCode,
    public readonly statusCode: number = 500,
    public readonly sourceId?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ReactiveError';
  }
}

export type ReactiveErrorCode =
  | 'SOURCE_NOT_FOUND'
  | 'BINDING_NOT_FOUND'
  | 'BINDING_RESOLUTION_FAILED'
  | 'EXPRESSION_PARSE_FAILED'
  | 'EXPRESSION_EVALUATION_FAILED'
  | 'QUERY_EXECUTION_FAILED'
  | 'SUBSCRIPTION_FAILED'
  | 'SOURCE_TYPE_UNSUPPORTED'
  | 'INVALID_FILTER'
  | 'CIRCULAR_DEPENDENCY'
  | 'VARIABLE_NOT_FOUND';
