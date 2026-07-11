export type PortType = 'input' | 'output';
export type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';

export interface PortDefinition {
  id: string;
  label: string;
  type: PortType;
  dataType: DataType;
  description?: string;
  required?: boolean;
  acceptsMultiple?: boolean;
}
