export type BindingSourceType =
  | 'user'
  | 'workflow_variable'
  | 'connector_action'
  | 'database_query'
  | 'api_endpoint'
  | 'live_query'
  | 'websocket'
  | 'computed'
  | 'static';

export interface BindingSource {
  type: BindingSourceType;
  config: Record<string, unknown>;
  path?: string;
}

export interface BindingTarget {
  componentId: string;
  property: string;
  element?: string;
}

export interface BindingDefinition {
  id: string;
  projectId: string;
  name: string;
  source: BindingSource;
  target?: BindingTarget;
  transform?: TransformConfig;
  fallback?: unknown;
  cacheTTL?: number;
}

export interface TransformConfig {
  type: 'formula' | 'map' | 'filter' | 'sort' | 'limit' | 'format';
  expression?: string;
  field?: string;
  direction?: 'asc' | 'desc';
  limit?: number;
  format?: string;
}

export interface BindingMap {
  [componentId: string]: {
    [property: string]: BindingDefinition;
  };
}
