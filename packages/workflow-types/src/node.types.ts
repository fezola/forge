export type NodeType =
  | 'trigger'
  | 'action'
  | 'condition'
  | 'loop'
  | 'delay'
  | 'switch'
  | 'merge'
  | 'parallel'
  | 'variable'
  | 'webhook'
  | 'api_call'
  | 'database'
  | 'email'
  | 'end';

export type TriggerType = 'manual' | 'webhook' | 'schedule' | 'event' | 'identity_event' | 'form_submit';

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodePort {
  id: string;
  label: string;
  type: 'input' | 'output';
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
}

export interface NodeDefinition {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  config: Record<string, unknown>;
  position: NodePosition;
  inputPorts: NodePort[];
  outputPorts: NodePort[];
  metadata?: {
    connectorId?: string;
    actionId?: string;
    triggerId?: string;
    icon?: string;
    color?: string;
  };
}

export interface EdgeDefinition {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  label?: string;
  condition?: string;
}

export interface NodeConfig {
  [key: string]: unknown;
}

export type NodeCategory = 'triggers' | 'logic' | 'data' | 'connectors' | 'variables' | 'identity';

export interface NodeTemplate {
  type: NodeType;
  category: NodeCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultConfig: Record<string, unknown>;
  inputPorts: NodePort[];
  outputPorts: NodePort[];
}
