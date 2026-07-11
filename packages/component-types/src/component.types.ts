export interface Component {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  categoryId?: string | null;
  type: ComponentType;
  framework: string;
  authorId: string;
  authorName?: string | null;
  organizationId?: string | null;
  license?: string | null;
  thumbnail?: string | null;
  tags: string[];
  status: ComponentStatus;
  isPublic: boolean;
  installCount: number;
  rating?: number | null;
  createdAt: string;
  updatedAt: string;
}

export type ComponentType = 'ui' | 'data' | 'logic' | 'layout' | 'navigation' | 'form' | 'media' | 'utility';
export type ComponentStatus = 'draft' | 'published' | 'deprecated' | 'archived';

export interface CreateComponentRequest {
  name: string;
  slug: string;
  description?: string;
  categoryId?: string;
  type?: ComponentType;
  framework?: string;
  license?: string;
  tags?: string[];
  isPublic?: boolean;
}
