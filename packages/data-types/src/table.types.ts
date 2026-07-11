export type TableStatus = 'active' | 'archived' | 'restoring';

export interface TableDefinition {
  id: string;
  projectId: string;
  providerId: string | null;
  name: string;
  description: string | null;
  fields: FieldDefinition[];
  indexes: IndexDefinition[];
  relationships: RelationshipDefinition[];
  rowCount: number;
  status: TableStatus;
  settings: TableSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TableSettings {
  enableRealtime: boolean;
  enableSearch: boolean;
  enableVersionHistory: boolean;
  enableRowLevelSecurity: boolean;
  auditLog: boolean;
  defaultSort: { fieldId: string; direction: 'asc' | 'desc' } | null;
  pageSize: number;
}

export interface FieldDefinition {
  id: string;
  tableId: string;
  name: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  indexed: boolean;
  defaultValue: unknown | null;
  description: string | null;
  position: number;
  settings: FieldSettings;
  createdAt: string;
  updatedAt: string;
}

export interface FieldSettings {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  precision?: number;
  scale?: number;
  pattern?: string;
  options?: string[];
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  timezone?: string;
  format?: string;
  currency?: string;
  locale?: string;
  relationTableId?: string;
  relationFieldId?: string;
  relationType?: 'one_to_one' | 'one_to_many' | 'many_to_many';
  formula?: string;
  computed?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  sensitive?: boolean;
}

export type FieldType =
  | 'text'
  | 'long_text'
  | 'number'
  | 'decimal'
  | 'boolean'
  | 'email'
  | 'phone'
  | 'password'
  | 'url'
  | 'date'
  | 'time'
  | 'date_time'
  | 'image'
  | 'video'
  | 'file'
  | 'json'
  | 'location'
  | 'currency'
  | 'color'
  | 'markdown'
  | 'code'
  | 'rich_text'
  | 'rating'
  | 'progress'
  | 'tags'
  | 'array'
  | 'reference'
  | 'relation'
  | 'formula'
  | 'auto_id'
  | 'created_at'
  | 'updated_at'
  | 'created_by'
  | 'updated_by';

export interface IndexDefinition {
  id: string;
  tableId: string;
  name: string;
  fields: string[];
  unique: boolean;
  type: 'btree' | 'hash' | 'gin' | 'gist';
}

export interface RelationshipDefinition {
  id: string;
  tableId: string;
  fieldId: string;
  relatedTableId: string;
  relatedFieldId: string;
  type: 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many';
  foreignKeyName: string | null;
  onDelete: 'cascade' | 'restrict' | 'set_null' | 'no_action';
  onUpdate: 'cascade' | 'restrict' | 'set_null' | 'no_action';
}

export interface CreateTableRequest {
  projectId: string;
  name: string;
  description?: string;
  fields?: Array<Omit<FieldDefinition, 'id' | 'tableId' | 'createdAt' | 'updatedAt'>>;
  settings?: Partial<TableSettings>;
}

export interface UpdateTableRequest {
  name?: string;
  description?: string | null;
  settings?: Partial<TableSettings>;
  status?: TableStatus;
}

export interface ITableRepository {
  findById(id: string): Promise<TableDefinition | null>;
  findByName(projectId: string, name: string): Promise<TableDefinition | null>;
  findByProject(projectId: string): Promise<TableDefinition[]>;
  create(request: CreateTableRequest): Promise<TableDefinition>;
  update(id: string, data: UpdateTableRequest): Promise<TableDefinition>;
  delete(id: string): Promise<void>;
  addField(tableId: string, field: Omit<FieldDefinition, 'id' | 'tableId' | 'createdAt' | 'updatedAt'>): Promise<FieldDefinition>;
  updateField(fieldId: string, data: Partial<FieldDefinition>): Promise<FieldDefinition>;
  deleteField(fieldId: string): Promise<void>;
  addIndex(tableId: string, index: Omit<IndexDefinition, 'id' | 'tableId'>): Promise<IndexDefinition>;
  deleteIndex(indexId: string): Promise<void>;
  addRelationship(tableId: string, rel: Omit<RelationshipDefinition, 'id' | 'tableId'>): Promise<RelationshipDefinition>;
  deleteRelationship(relId: string): Promise<void>;
}