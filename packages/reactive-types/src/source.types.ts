export type DataSourceType =
  | 'user.current'
  | 'user.profile'
  | 'user.session'
  | 'workflow.output'
  | 'workflow.variable'
  | 'connector.action'
  | 'database.table'
  | 'database.query'
  | 'api.rest'
  | 'api.graphql'
  | 'websocket.stream'
  | 'computed.expression'
  | 'static.value';

export interface DataSource {
  id: string;
  projectId: string;
  type: DataSourceType;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  schema?: DataSourceSchema;
}

export interface DataSourceSchema {
  fields: DataSourceField[];
}

export interface DataSourceField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date' | 'any';
  path: string;
  nullable?: boolean;
  description?: string;
}

export interface DataSourceHierarchy {
  category: string;
  sources: DataSourceSummary[];
}

export interface DataSourceSummary {
  id: string;
  name: string;
  type: DataSourceType;
  description?: string;
  icon?: string;
}
