export type DataEventType =
  | 'record.created'
  | 'record.updated'
  | 'record.deleted'
  | 'record.restored'
  | 'table.created'
  | 'table.updated'
  | 'table.deleted'
  | 'field.added'
  | 'field.removed'
  | 'field.updated'
  | 'import.completed'
  | 'import.failed'
  | 'backup.completed'
  | 'backup.failed'
  | 'backup.restored'
  | 'schema.changed'
  | 'provider.connected'
  | 'provider.disconnected'
  | 'provider.error';

export interface DataEvent {
  id: string;
  type: DataEventType;
  projectId: string;
  tableId: string | null;
  recordId: string | null;
  data: Record<string, unknown>;
  previousData: Record<string, unknown> | null;
  changedBy: string | null;
  timestamp: string;
}

export interface DataEventPayload {
  type: DataEventType;
  projectId: string;
  tableId?: string;
  recordId?: string;
  data: Record<string, unknown>;
  previous?: Record<string, unknown>;
  changedBy?: string;
}

export interface IDataEventBus {
  emit(payload: DataEventPayload): Promise<DataEvent>;
  onTable(tableId: string, handler: DataEventHandler): void;
  onProject(projectId: string, handler: DataEventHandler): void;
  onType(type: DataEventType, handler: DataEventHandler): void;
  removeTableListener(tableId: string, handler: DataEventHandler): void;
  removeProjectListener(projectId: string, handler: DataEventHandler): void;
  removeTypeListener(type: DataEventType, handler: DataEventHandler): void;
}

export type DataEventHandler = (event: DataEvent) => void | Promise<void>;

export interface DataEventConfig {
  tableId: string;
  enabled: boolean;
  events: DataEventType[];
  webhookUrl?: string;
  webhookSecret?: string;
  workflowId?: string;
}