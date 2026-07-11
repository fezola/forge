export type BackupStatus = 'pending' | 'running' | 'completed' | 'failed' | 'restoring';

export type BackupFrequency = 'manual' | 'hourly' | 'daily' | 'weekly';

export interface BackupJob {
  id: string;
  projectId: string;
  frequency: BackupFrequency;
  status: BackupStatus;
  tables: string[];
  sizeBytes: number | null;
  recordCount: number | null;
  location: string;
  startedAt: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  error: string | null;
  createdBy: string;
  createdAt: string;
}

export interface BackupConfig {
  projectId: string;
  enabled: boolean;
  hourlyRetention: number;
  dailyRetention: number;
  weeklyRetention: number;
  schedule: {
    hourly: boolean;
    dailyAt: string;
    weeklyOn: number;
    weeklyAt: string;
  };
  includeTables: string[] | null;
  excludeTables: string[] | null;
  storageProvider: string;
  storageConfig: Record<string, unknown>;
}

export interface IBackupEngine {
  createBackup(projectId: string, tables?: string[], createdBy?: string): Promise<BackupJob>;
  restoreBackup(backupId: string, tables?: string[]): Promise<BackupJob>;
  listBackups(projectId: string, offset?: number, limit?: number): Promise<BackupJob[]>;
  getBackup(id: string): Promise<BackupJob | null>;
  deleteBackup(id: string): Promise<void>;
  getConfig(projectId: string): Promise<BackupConfig>;
  updateConfig(projectId: string, config: Partial<BackupConfig>): Promise<BackupConfig>;
}