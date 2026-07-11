import { NodeType, NodePosition, NodePort } from '@forge/workflow-types';

export class NodeEntity {
  constructor(
    public readonly id: string,
    public type: NodeType,
    public label: string,
    public description: string,
    public config: Record<string, unknown>,
    public position: NodePosition,
    public inputPorts: NodePort[],
    public outputPorts: NodePort[],
    public metadata?: {
      connectorId?: string;
      actionId?: string;
      triggerId?: string;
      icon?: string;
      color?: string;
    },
  ) {}

  static create(input: {
    type: NodeType;
    label: string;
    description?: string;
    config?: Record<string, unknown>;
    position?: NodePosition;
    metadata?: { connectorId?: string; actionId?: string; triggerId?: string; icon?: string; color?: string };
  }): NodeEntity {
    return new NodeEntity(
      crypto.randomUUID(),
      input.type,
      input.label,
      input.description || '',
      input.config || {},
      input.position || { x: 0, y: 0 },
      NodeEntity.defaultInputPorts(input.type),
      NodeEntity.defaultOutputPorts(input.type),
      input.metadata,
    );
  }

  private static defaultInputPorts(type: NodeType): NodePort[] {
    const base: NodePort[] = [{ id: 'in', label: 'Input', type: 'input', dataType: 'any' }];
    if (type === 'condition' || type === 'switch') {
      base.push({ id: 'condition', label: 'Condition', type: 'input', dataType: 'boolean' });
    }
    if (type === 'loop') {
      base.push({ id: 'items', label: 'Items', type: 'input', dataType: 'array' });
    }
    return base;
  }

  private static defaultOutputPorts(type: NodeType): NodePort[] {
    const base: NodePort[] = [{ id: 'out', label: 'Output', type: 'output', dataType: 'any' }];
    if (type === 'condition') {
      return [
        { id: 'true', label: 'True', type: 'output', dataType: 'any' },
        { id: 'false', label: 'False', type: 'output', dataType: 'any' },
      ];
    }
    if (type === 'switch') {
      return base;
    }
    if (type === 'merge') {
      return [{ id: 'out', label: 'Merged', type: 'output', dataType: 'any' }];
    }
    return base;
  }
}
