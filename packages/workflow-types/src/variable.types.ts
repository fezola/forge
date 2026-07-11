export interface VariableReference {
  source: 'trigger' | 'step_output' | 'workflow_variable' | 'secret';
  nodeId?: string;
  variableName: string;
  jsonPath?: string;
}

export interface VariableBinding {
  targetVariable: string;
  source: VariableReference;
}

export interface WorkflowVariableStore {
  [key: string]: unknown;
}

export const VARIABLE_PATTERN = /\{\{([\w.]+)\}\}/g;
