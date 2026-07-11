export type ImportSourceType = 'csv' | 'excel' | 'json' | 'airtable' | 'notion' | 'google_sheets' | 'external_provider';

export type ImportStatus = 'pending' | 'mapping' | 'running' | 'completed' | 'partial' | 'failed';

export interface ImportJob {
  id: string;
  projectId: string;
  tableId: string | null;
  sourceType: ImportSourceType;
  sourceConfig: ImportSourceConfig;
  fieldMapping: FieldMapping[];
  status: ImportStatus;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors: ImportError[];
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
}

export interface ImportSourceConfig {
  fileUrl?: string;
  fileContent?: string;
  sheetUrl?: string;
  sheetId?: string;
  apiKey?: string;
  externalProviderId?: string;
  externalTableName?: string;
  encoding?: string;
  delimiter?: string;
  hasHeader?: boolean;
  skipRows?: number;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: string;
  defaultValue?: unknown;
  required?: boolean;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: unknown;
}

export interface IImportEngine {
  startImport(job: Omit<ImportJob, 'id' | 'createdAt' | 'completedAt'>): Promise<ImportJob>;
  preview(sourceType: ImportSourceType, source: ImportSourceConfig): Promise<{ fields: string[]; sampleRows: Record<string, unknown>[]; totalEstimate: number }>;
  getJob(id: string): Promise<ImportJob | null>;
  listJobs(projectId: string): Promise<ImportJob[]>;
  cancelJob(id: string): Promise<void>;
}