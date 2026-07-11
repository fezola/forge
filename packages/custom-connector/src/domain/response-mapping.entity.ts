export class ResponseMappingEntity {
  constructor(
    public readonly id: string,
    public readonly fieldName: string,
    public readonly jsonPath: string,
    public readonly fieldType: 'string' | 'number' | 'boolean' | 'object' | 'array',
    public readonly required: boolean,
    public readonly defaultValue?: unknown,
  ) {}

  static create(input: {
    fieldName: string;
    jsonPath: string;
    fieldType: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    defaultValue?: unknown;
  }): ResponseMappingEntity {
    return new ResponseMappingEntity(
      crypto.randomUUID(),
      input.fieldName,
      input.jsonPath,
      input.fieldType,
      input.required || false,
      input.defaultValue,
    );
  }
}
