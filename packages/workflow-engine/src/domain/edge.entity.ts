export class EdgeEntity {
  constructor(
    public readonly id: string,
    public readonly sourceNodeId: string,
    public readonly sourcePortId: string,
    public readonly targetNodeId: string,
    public readonly targetPortId: string,
    public label?: string,
    public condition?: string,
  ) {}

  static create(input: {
    sourceNodeId: string;
    sourcePortId: string;
    targetNodeId: string;
    targetPortId: string;
    label?: string;
    condition?: string;
  }): EdgeEntity {
    return new EdgeEntity(
      crypto.randomUUID(),
      input.sourceNodeId,
      input.sourcePortId,
      input.targetNodeId,
      input.targetPortId,
      input.label,
      input.condition,
    );
  }
}
