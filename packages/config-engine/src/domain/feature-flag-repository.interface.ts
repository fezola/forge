import type { FeatureFlag, CreateFeatureFlagInput, UpdateFeatureFlagInput, FlagOverride } from '@forge/config-types';

export const IFeatureFlagRepository = Symbol('IFeatureFlagRepository');

export interface IFeatureFlagRepository {
  create(input: CreateFeatureFlagInput & { id: string; createdBy: string }): Promise<FeatureFlag>;
  update(id: string, input: UpdateFeatureFlagInput & { updatedBy: string }): Promise<FeatureFlag>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<FeatureFlag | null>;
  findByKey(key: string, projectId?: string): Promise<FeatureFlag | null>;
  findByProject(projectId: string): Promise<FeatureFlag[]>;
  setOverride(input: FlagOverride): Promise<FlagOverride>;
  removeOverride(flagId: string, identityId?: string, organizationId?: string, projectId?: string): Promise<void>;
  getOverrides(flagId: string): Promise<FlagOverride[]>;
  getEffectiveOverride(flagId: string, identityId?: string, organizationId?: string, projectId?: string, environmentId?: string): Promise<FlagOverride | null>;
  listActive(): Promise<FeatureFlag[]>;
}