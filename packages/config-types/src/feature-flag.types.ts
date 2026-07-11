export type FlagStatus = 'active' | 'inactive' | 'deprecated' | 'removed';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  status: FlagStatus;
  enabled: boolean;
  rolloutPercentage?: number;
  sticky: boolean;
  targetIdentities?: string[];
  targetOrganizations?: string[];
  targetProjects?: string[];
  targetEnvironments?: string[];
  requiredPermissions?: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateFeatureFlagInput {
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
  rolloutPercentage?: number;
  sticky?: boolean;
  targetIdentities?: string[];
  targetOrganizations?: string[];
  targetProjects?: string[];
  targetEnvironments?: string[];
  requiredPermissions?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateFeatureFlagInput {
  name?: string;
  description?: string;
  enabled?: boolean;
  status?: FlagStatus;
  rolloutPercentage?: number;
  sticky?: boolean;
  targetIdentities?: string[];
  targetOrganizations?: string[];
  targetProjects?: string[];
  targetEnvironments?: string[];
  requiredPermissions?: string[];
  metadata?: Record<string, unknown>;
}

export interface FeatureFlagEvaluation {
  flag: FeatureFlag;
  enabled: boolean;
  reason: string;
  evaluatedAt: string;
}

export interface FlagOverride {
  id: string;
  flagId: string;
  identityId?: string;
  organizationId?: string;
  projectId?: string;
  environmentId?: string;
  enabled: boolean;
  createdAt: string;
  createdBy: string;
}