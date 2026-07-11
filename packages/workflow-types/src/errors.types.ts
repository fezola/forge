export class WorkflowError extends Error {
  constructor(
    message: string,
    public readonly code: WorkflowErrorCode,
    public readonly statusCode: number = 500,
    public readonly nodeId?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'WorkflowError';
  }
}

export type WorkflowErrorCode =
  | 'WORKFLOW_NOT_FOUND'
  | 'WORKFLOW_INVALID_GRAPH'
  | 'WORKFLOW_EXECUTION_FAILED'
  | 'NODE_EXECUTION_FAILED'
  | 'NODE_NOT_FOUND'
  | 'NODE_TYPE_UNSUPPORTED'
  | 'CIRCULAR_DEPENDENCY'
  | 'VARIABLE_RESOLUTION_FAILED'
  | 'TRIGGER_NOT_FOUND'
  | 'VERSION_CONFLICT'
  | 'MAX_RETRIES_EXCEEDED';
