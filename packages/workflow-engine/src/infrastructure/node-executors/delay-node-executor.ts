import { Injectable } from '@nestjs/common';
import { INodeExecutor } from '../../domain/node-executor.interface';
import { NodeDefinition, NodeExecutionResult } from '@forge/workflow-types';

@Injectable()
export class DelayNodeExecutor implements INodeExecutor {
  canHandle(nodeType: string): boolean {
    return nodeType === 'delay';
  }

  async execute(
    node: NodeDefinition,
    context: { variables: Record<string, unknown>; input: Record<string, unknown>; secrets: Record<string, string> },
  ): Promise<NodeExecutionResult> {
    const start = new Date().toISOString();
    const config = node.config as any;
    const durationMs = (config.seconds || 1) * 1000;

    await new Promise(resolve => setTimeout(resolve, durationMs));

    return {
      nodeId: node.id,
      nodeType: node.type,
      status: 'completed',
      input: context.input,
      output: { waitedMs: durationMs },
      startedAt: start,
      completedAt: new Date().toISOString(),
      attempts: 1,
    };
  }
}
