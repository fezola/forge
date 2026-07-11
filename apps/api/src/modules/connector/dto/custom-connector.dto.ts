export class CreateCustomConnectorDto {
  projectId!: string;
  name!: string;
  description?: string;
  authConfig!: any;
  baseUrl!: string;
  globalHeaders?: Record<string, string>;
}

export class AddEndpointDto {
  name!: string;
  description?: string;
  method!: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path!: string;
  requestHeaders?: Record<string, string>;
  requestBody?: Record<string, unknown>;
}

export class AddMappingDto {
  fieldName!: string;
  jsonPath!: string;
  fieldType!: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  defaultValue?: unknown;
}
