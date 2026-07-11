export interface ResourceMetadata {
  id: string;
  resourceId: string;
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'array';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface MetadataFilter {
  key: string;
  operator: 'eq' | 'neq' | 'contains' | 'exists' | 'gt' | 'gte' | 'lt' | 'lte';
  value?: unknown;
}

export interface MetadataSchema {
  resourceType: string;
  allowedKeys: string[];
  requiredKeys: string[];
  keyTypes: Record<string, 'string' | 'number' | 'boolean' | 'date' | 'json' | 'array'>;
}