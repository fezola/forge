export interface DataVersion {
  id: string;
  tableId: string;
  recordId: string;
  version: number;
  fieldsBefore: Record<string, unknown>;
  fieldsAfter: Record<string, unknown>;
  action: 'create' | 'update' | 'delete';
  changedBy: string | null;
  changedFields: string[];
  timestamp: string;
}

export interface DataSnapshot {
  id: string;
  tableId: string;
  label: string | null;
  data: Record<string, Array<Record<string, unknown>>>;
  recordCount: number;
  createdBy: string;
  createdAt: string;
}

export interface IVersionRepository {
  getVersions(tableId: string, recordId: string, offset?: number, limit?: number): Promise<DataVersion[]>;
  createVersion(version: Omit<DataVersion, 'id' | 'timestamp'>): Promise<DataVersion>;
  getSnapshot(id: string): Promise<DataSnapshot | null>;
  createSnapshot(tableId: string, label?: string, createdBy?: string): Promise<DataSnapshot>;
  restoreSnapshot(snapshotId: string): Promise<number>;
  getVersionById(id: string): Promise<DataVersion | null>;
  getRecordAtVersion(tableId: string, recordId: string, version: number): Promise<Record<string, unknown> | null>;
  deleteVersionsOlderThan(tableId: string, timestamp: string): Promise<number>;
}