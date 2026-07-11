import { Injectable } from '@nestjs/common';
import { INodeExecutor } from '../../domain/node-executor.interface';
import { NodeDefinition, NodeExecutionResult } from '@forge/workflow-types';
import { ConnectorRuntimeService } from '@forge/connector-runtime';

@Injectable()
export class ActionNodeExecutor implements INodeExecutor {
  constructor(private readonly runtime: ConnectorRuntimeService) {}

  canHandle(nodeType: string): boolean {
    return nodeType === 'action';
  }

  async execute(
    node: NodeDefinition,
    context: { variables: Record<string, unknown>; input: Record<string, unknown>; secrets: Record<string, string> },
  ): Promise<NodeExecutionResult> {
    const start = new Date().toISOString();
    const config = node.config as any;

    try {
      const result = await this.runtime.execute(
        config.installationId,
        config.actionId,
        context.input as Record<string, unknown>,
        config.projectId,
      );

      return {
        nodeId: node.id,
        nodeType: node.type,
        status: result.success ? 'completed' : 'failed',
        input: context.input,
        output: result.data,
        error: result.error,
        startedAt: start,
        completedAt: new Date().toISOString(),
        attempts: 1,
      };
    } catch (error: any) {
      return {
        nodeId: node.id,
        nodeType: node.type,
        status: 'failed',
        input: context.input,
        error: error.message,
        startedAt: start,
        completedAt: new Date().toISOString(),
        attempts: 1,
      };
    }
  }
}
