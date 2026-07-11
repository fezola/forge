export interface ResourceComment {
  id: string;
  resourceId: string;
  parentId?: string;
  authorId: string;
  authorName?: string;
  body: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  edited: boolean;
}

export interface CreateCommentInput {
  resourceId: string;
  parentId?: string;
  body: string;
  authorId: string;
  authorName?: string;
}

export interface UpdateCommentInput {
  body: string;
}