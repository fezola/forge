import { Injectable } from '@nestjs/common';
import { INodeExecutor } from '../../domain/node-executor.interface';
import { NodeDefinition, NodeExecutionResult } from '@forge/workflow-types';

@Injectable()
export class VariableNodeExecutor implements INodeExecutor {
  canHandle(nodeType: string): boolean {
    return nodeType === 'variable';
  }

  async execute(
    node: NodeDefinition,
    context: { variables: Record<string, unknown>; input: Record<string, unknown>; secrets: Record<string, string> },
  ): Promise<NodeExecutionResult> {
    const start = new Date().toISOString();
    const config = node.config as any;

    const output: Record<string, unknown> = {};

    if (config.operation === 'set') {
      output[config.variableName] = this.resolveValue(config.value, context);
      context.variables[config.variableName] = output[config.variableName];
    }

    if (config.operation === 'transform') {
      const sourceValue = context.variables[config.sourceVariable];
      const transformType = config.transformType;
      switch (transformType) {
        case 'uppercase': output[config.variableName] = String(sourceValue).toUpperCase(); break;
        case 'lowercase': output[config.variableName] = String(sourceValue).toLowerCase(); break;
        case 'json_parse': output[config.variableName] = JSON.parse(String(sourceValue)); break;
        case 'json_stringify': output[config.variableName] = JSON.stringify(sourceValue); break;
        case 'number': output[config.variableName] = Number(sourceValue); break;
        case 'string': output[config.variableName] = String(sourceValue); break;
        default: output[config.variableName] = sourceValue;
      }
      context.variables[config.variableName] = output[config.variableName];
    }

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
