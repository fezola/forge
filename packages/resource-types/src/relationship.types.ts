export type RelationshipType = 'uses' | 'used_by' | 'contains' | 'belongs_to' | 'depends_on' | 'deploys_to' | 'references' | 'owns' | 'member_of' | 'custom';

export interface ResourceRelationship {
  id: string;
  sourceResourceId: string;
  targetResourceId: string;
  relationshipType: RelationshipType;
  label?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
}

export interface CreateRelationshipInput {
  sourceResourceId: string;
  targetResourceId: string;
  relationshipType: RelationshipType;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface ResourceGraphNode {
  resourceId: string;
  type: string;
  name: string;
  lifecycleState: string;
  health?: string;
}

export interface ResourceGraphEdge {
  sourceId: string;
  targetId: string;
  relationshipType: RelationshipType;
  label?: string;
}

export interface ResourceGraph {
  nodes: ResourceGraphNode[];
  edges: ResourceGraphEdge[];
}