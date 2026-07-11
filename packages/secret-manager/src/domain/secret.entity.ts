export class Secret {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly encryptedValue: string,
    public readonly provider: 'project' | 'connector' | 'global',
    public readonly projectId?: string,
    public readonly connectorId?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(input: {
    name: string;
    encryptedValue: string;
    provider: 'project' | 'connector' | 'global';
    projectId?: string;
    connectorId?: string;
  }): Secret {
    return new Secret(
      crypto.randomUUID(),
      input.name,
      input.encryptedValue,
      input.provider,
      input.projectId,
      input.connectorId,
    );
  }
}
