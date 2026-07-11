import { Injectable } from '@nestjs/common';
import { INodeExecutor } from '../../domain/node-executor.interface';
import { NodeDefinition, NodeExecutionResult } from '@forge/workflow-types';

@Injectable()
export class ConditionNodeExecutor implements INodeExecutor {
  canHandle(nodeType: string): boolean {
    return nodeType === 'condition';
  }

  async execute(
    node: NodeDefinition,
    context: { variables: Record<string, unknown>; input: Record<string, unknown>; secrets: Record<string, string> },
  ): Promise<NodeExecutionResult> {
    const start = new Date().toISOString();
    const config = node.config as any;
    const leftValue = this.resolveValue(config.left, context);
    const rightValue = this.resolveValue(config.right, context);
    const operator = config.operator || 'equals';

    let result = false;
    switch (operator) {
      case 'equals': result = leftValue === rightValue; break;
      case 'not_equals': result = leftValue !== rightValue; break;
      case 'greater_than': result = Number(leftValue) > Number(rightValue); break;
      case 'less_than': result = Number(leftValue) < Number(rightValue); break;
      case 'contains': result = String(leftValue).includes(String(rightValue)); break;
      case 'starts_with': result = String(leftValue).startsWith(String(rightValue)); break;
      case 'ends_with': result = String(leftValue).endsWith(String(rightValue)); break;
      case 'is_empty': result = !leftValue || leftValue === ''; break;
      case 'is_true': result = Boolean(leftValue); break;
      case 'is_false': result = !Boolean(leftValue); break;
      case 'exists': result = leftValue !== undefined && leftValue !== null; break;
      default: result = leftValue === rightValue;
    }

    return {
      nodeId: node.id,
      nodeType: node.type,
      status: 'completed',
      input: context.input,
      output: result,
      startedAt: start,
      completedAt: new Date().toISOString(),
      attempts: 1,
    };
  }

  private resolveValue(value: unknown, context: { variables: Record<string, unknown> }): unknown {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const path = value.slice(2, -2);
      return this.getPath(context.variables, path);
    }
    return value;
  }

  private getPath(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((acc: any, part) => acc?.[part], obj);
  }
}
