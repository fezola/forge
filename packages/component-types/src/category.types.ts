export interface ComponentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  sortOrder: number;
  parentId?: string | null;
  children?: ComponentCategory[];
  createdAt: string;
}
