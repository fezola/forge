export interface ActivityEntry {
  id: string;
  resourceId: string;
  resourceType: string;
  resourceName: string;
  projectId?: string;
  actorId: string;
  actorName: string;
  action: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface ActivityFeedFilter {
  projectId?: string;
  resourceId?: string;
  resourceType?: string;
  actorId?: string;
  offset?: number;
  limit?: number;
  createdAfter?: string;
}