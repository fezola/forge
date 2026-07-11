import { NodeDefinition, WorkflowVariable, NodeExecutionResult } from '@forge/workflow-types';

export interface INodeExecutor {
  canHandle(nodeType: string): boolean;
  execute(
    node: NodeDefinition,
    context: {
      variables: Record<string, unknown>;
      input: Record<string, unknown>;
      secrets: Record<string, string>;
    },
  ): Promise<NodeExecutionResult>;
}
