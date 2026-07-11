export interface ComponentDependency {
  id: string;
  componentId: string;
  dependentId: string;
  versionRange: string;
  type: DependencyType;
  createdAt: string;
}

export type DependencyType = 'required' | 'optional' | 'peer';
