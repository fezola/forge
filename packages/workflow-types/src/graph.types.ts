import { NodeDefinition, EdgeDefinition } from './node.types';

export interface WorkflowGraph {
  nodes: NodeDefinition[];
  edges: EdgeDefinition[];
}

export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  scope: 'global' | 'step' | 'trigger';
  defaultValue?: unknown;
  description?: string;
}
