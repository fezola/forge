export interface ResourceSearchQuery {
  query: string;
  types?: string[];
  projectId?: string;
  organizationId?: string;
  ownerId?: string;
  lifecycleStates?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
  sortBy?: 'relevance' | 'name' | 'createdAt' | 'updatedAt' | 'type';
  sortDirection?: 'asc' | 'desc';
  offset?: number;
  limit?: number;
}

export interface ResourceSearchResult {
  items: ResourceSearchHit[];
  total: number;
  offset: number;
  limit: number;
  query: string;
  tookMs: number;
}

export interface ResourceSearchHit {
  resourceId: string;
  type: string;
  name: string;
  description?: string;
  slug: string;
  lifecycleState: string;
  tags: string[];
  score: number;
  highlights?: Record<string, string[]>;
  matchedFields: string[];
  updatedAt: string;
}

export interface SearchIndexEntry {
  resourceId: string;
  type: string;
  name: string;
  description?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  textContent: string;
  projectId?: string;
  organizationId?: string;
  ownerId?: string;
  lifecycleState: string;
  createdAt: string;
  updatedAt: string;
}