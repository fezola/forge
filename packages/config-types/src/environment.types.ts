export type EnvironmentType = 'development' | 'staging' | 'production' | 'preview' | 'sandbox';

export interface Environment {
  id: string;
  projectId: string;
  name: string;
  type: EnvironmentType;
  slug: string;
  description?: string;
  isDefault: boolean;
  order: number;
  parentId?: string;
  protected: boolean;
  requiresApproval: boolean;
  approvalRequiredActions?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateEnvironmentInput {
  projectId: string;
  name: string;
  type: EnvironmentType;
  slug?: string;
  description?: string;
  isDefault?: boolean;
  order?: number;
  parentId?: string;
  protected?: boolean;
  requiresApproval?: boolean;
}

export interface UpdateEnvironmentInput {
  name?: string;
  description?: string;
  isDefault?: boolean;
  order?: number;
  protected?: boolean;
  requiresApproval?: boolean;
}

export interface EnvironmentPromotionRequest {
  id: string;
  environmentId: string;
  targetEnvironmentId: string;
  configIds: string[];
  status: 'pending' | 'approved' | 'rejected' | 'promoted';
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  promotedAt?: string;
  createdAt: string;
}

export interface EnvironmentSnapshot {
  id: string;
  environmentId: string;
  label: string;
  configValues: Record<string, string>;
  createdAt: string;
  createdBy: string;
}