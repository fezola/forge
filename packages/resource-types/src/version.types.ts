export interface ResourceVersion {
  id: string;
  resourceId: string;
  versionNumber: number;
  data: Record<string, unknown>;
  diff?: Record<string, { from: unknown; to: unknown }>;
  createdBy: string;
  createdAt: string;
  label?: string;
}

export interface CreateResourceVersionInput {
  resourceId: string;
  data: Record<string, unknown>;
  diff?: Record<string, { from: unknown; to: unknown }>;
  createdBy: string;
  label?: string;
}