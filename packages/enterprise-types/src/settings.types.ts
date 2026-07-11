export interface EnterpriseSettings {
  id: string;
  projectId: string;
  ssoRequired: boolean;
  mfaRequired: boolean;
  mfaMethods: string[];
  passwordPolicy?: Record<string, unknown> | null;
  sessionTimeout: number;
  maxLoginAttempts: number;
  ipWhitelist: string[];
  ipBlacklist: string[];
  auditRetentionDays: number;
  allowedDomains: string[];
  restrictedDomains: string[];
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
