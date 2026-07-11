import { Injectable } from '@nestjs/common';
import { INodeExecutor } from '../../domain/node-executor.interface';
import { NodeDefinition, NodeExecutionResult } from '@forge/workflow-types';

@Injectable()
export class SwitchNodeExecutor implements INodeExecutor {
  canHandle(nodeType: string): boolean {
    return nodeType === 'switch';
  }

  async execute(
    node: NodeDefinition,
    context: { variables: Record<string, unknown>; input: Record<string, unknown>; secrets: Record<string, string> },
  ): Promise<NodeExecutionResult> {
    const start = new Date().toISOString();
    const config = node.config as any;
    const value = this.resolveValue(config.value, context);
    const cases: Array<{ value: string; label: string }> = config.cases || [];

    const matchedCase = cases.find(c => c.value === String(value));
    const output = {
      value,
      matchedCase: matchedCase?.label || 'default',
    };

    return {
      nodeId: node.id,
      nodeType: node.type,
      status: 'completed',
      input: context.input,
      output,
      startedAt: start,
      completedAt: new Date().toISOString(),
      attempts: 1,
    };
  }

  private resolveValue(value: any, context: { variables: Record<string, unknown> }): unknown {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const path = value.slice(2, -2);
      return path.split('.').reduce((acc: unknown, part) => (acc as Record<string, unknown>)?.[part], context.variables);
    }
    return value;
  }
}
