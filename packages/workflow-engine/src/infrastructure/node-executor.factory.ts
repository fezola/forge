import { Injectable } from '@nestjs/common';
import { INodeExecutor } from '../domain/node-executor.interface';
import { NodeDefinition, NodeExecutionResult } from '@forge/workflow-types';

@Injectable()
export class NodeExecutorFactory implements INodeExecutor {
  private executors: Map<string, INodeExecutor> = new Map();

  register(nodeType: string, executor: INodeExecutor): void {
    this.executors.set(nodeType, executor);
  }

  canHandle(nodeType: string): boolean {
    return this.executors.has(nodeType);
  }

  async execute(
    node: NodeDefinition,
    context: { variables: Record<string, unknown>; input: Record<string, unknown>; secrets: Record<string, string> },
  ): Promise<NodeExecutionResult> {
    const executor = this.executors.get(node.type);
    if (!executor) {
      return {
        nodeId: node.id,
        nodeType: node.type,
        status: 'failed',
        input: context.input,
        error: `No executor registered for node type: ${node.type}`,
        startedAt: new Date().toISOString(),
        attempts: 1,
      };
    }
    return executor.execute(node, context);
  }
}
