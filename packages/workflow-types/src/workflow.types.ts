import { WorkflowGraph, WorkflowVariable } from './graph.types';

export type WorkflowStatus = 'draft' | 'published' | 'archived';
export type TriggerType = 'manual' | 'webhook' | 'schedule' | 'event' | 'identity_event';

export interface WorkflowDefinition {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  version: number;
  status: WorkflowStatus;
  graph: WorkflowGraph;
  variables: WorkflowVariable[];
  trigger: WorkflowTrigger;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface WorkflowTrigger {
  type: TriggerType;
  config: Record<string, unknown>;
  webhookPath?: string;
  scheduleExpression?: string;
  eventType?: string;
}

export interface WorkflowSummary {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  version: number;
  status: WorkflowStatus;
  nodeCount: number;
  triggerType: string;
  createdAt: string;
  updatedAt: string;
}
