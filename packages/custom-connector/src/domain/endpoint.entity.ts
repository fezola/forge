export class EndpointEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    public readonly path: string,
    public readonly requestHeaders: Record<string, string>,
    public readonly requestBody?: Record<string, unknown>,
  ) {}

  static create(input: {
    name: string;
    description?: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    requestHeaders?: Record<string, string>;
    requestBody?: Record<string, unknown>;
  }): EndpointEntity {
    return new EndpointEntity(
      crypto.randomUUID(),
      input.name,
      input.description || '',
      input.method,
      input.path.startsWith('/') ? input.path : `/${input.path}`,
      input.requestHeaders || {},
      input.requestBody,
    );
  }
}
