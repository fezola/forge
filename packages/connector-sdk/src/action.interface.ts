export interface ActionInputField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'json' | 'file';
  required: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
  description?: string;
}

export interface ActionOutputField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
}

export interface ConnectorAction {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  input: ActionInputField[];
  output: ActionOutputField[];
  responseMapping?: Record<string, string>;
}