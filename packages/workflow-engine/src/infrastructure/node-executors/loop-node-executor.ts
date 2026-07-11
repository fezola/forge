import { Injectable } from '@nestjs/common';
import { INodeExecutor } from '../../domain/node-executor.interface';
import { NodeDefinition, NodeExecutionResult } from '@forge/workflow-types';

@Injectable()
export class LoopNodeExecutor implements INodeExecutor {
  canHandle(nodeType: string): boolean {
    return nodeType === 'loop';
  }

  async execute(
    node: NodeDefinition,
    context: { variables: Record<string, unknown>; input: Record<string, unknown>; secrets: Record<string, string> },
  ): Promise<NodeExecutionResult> {
    const start = new Date().toISOString();
    const config = node.config as any;
    const items = this.resolveItems(config.items, context);
    const variableName = config.variableName || 'item';
    const maxIterations = config.maxIterations || 100;

    const results: unknown[] = [];
    for (let i = 0; i < Math.min(items.length, maxIterations); i++) {
      context.variables[variableName] = items[i];
      context.variables['index'] = i;
      results.push(items[i]);
    }

    return {
      nodeId: node.id,
      nodeType: node.type,
      status: 'completed',
      input: context.input,
      output: { items: results, count: results.length, variableName },
      startedAt: start,
      completedAt: new Date().toISOString(),
      attempts: 1,
    };
  }

  private resolveItems(items: unknown, context: { variables: Record<string, unknown> }): unknown[] {
    if (typeof items === 'string') {
      const resolved = context.variables[items] || context.input[items];
      return Array.isArray(resolved) ? resolved : [];
    }
    return Array.isArray(items) ? items : [];
  }
}
