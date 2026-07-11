export interface ComplianceReport {
  id: string;
  projectId?: string | null;
  organizationId?: string | null;
  type: ComplianceType;
  title: string;
  description?: string | null;
  status: ComplianceStatus;
  periodStart: string;
  periodEnd: string;
  findings?: Record<string, unknown> | null;
  evidence?: Record<string, unknown> | null;
  score?: number | null;
  generatedBy: string;
  generatedAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ComplianceType = 'soc2' | 'hipaa' | 'gdpr' | 'pci' | 'custom';
export type ComplianceStatus = 'draft' | 'in_progress' | 'completed' | 'failed';
