import type { Environment, CreateEnvironmentInput, UpdateEnvironmentInput, EnvironmentPromotionRequest, EnvironmentSnapshot } from '@forge/config-types';

export const IEnvironmentRepository = Symbol('IEnvironmentRepository');

export interface IEnvironmentRepository {
  create(input: CreateEnvironmentInput & { id: string; slug: string; createdBy: string }): Promise<Environment>;
  update(id: string, input: UpdateEnvironmentInput): Promise<Environment>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Environment | null>;
  findByProject(projectId: string): Promise<Environment[]>;
  findBySlug(projectId: string, slug: string): Promise<Environment | null>;
  getDefault(projectId: string): Promise<Environment | null>;
  createPromotionRequest(input: Partial<EnvironmentPromotionRequest> & { id: string; requestedBy: string; status: 'pending' }): Promise<EnvironmentPromotionRequest>;
  approvePromotionRequest(id: string, approvedBy: string): Promise<EnvironmentPromotionRequest>;
  rejectPromotionRequest(id: string, rejectedBy: string): Promise<EnvironmentPromotionRequest>;
  completePromotion(id: string): Promise<EnvironmentPromotionRequest>;
  getPromotionRequestById(id: string): Promise<EnvironmentPromotionRequest | null>;
  getPromotionRequests(environmentId: string): Promise<EnvironmentPromotionRequest[]>;
  createSnapshot(input: Partial<EnvironmentSnapshot> & { id: string; createdBy: string }): Promise<EnvironmentSnapshot>;
  getSnapshots(environmentId: string): Promise<EnvironmentSnapshot[]>;
}