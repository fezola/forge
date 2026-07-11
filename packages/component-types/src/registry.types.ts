import type { Component } from './component.types';
import type { ComponentVersion } from './version.types';
import type { ComponentDependency } from './dependency.types';
import type { ComponentCategory } from './category.types';
import type { ComponentInstall } from './install.types';

export interface ComponentRegistryInterface {
  search(query: string, filters?: { type?: string; categoryId?: string; framework?: string; isPublic?: boolean }): Promise<Component[]>;
  getById(id: string): Promise<Component | null>;
  getBySlug(slug: string): Promise<Component | null>;
  getVersions(componentId: string): Promise<ComponentVersion[]>;
  getVersion(componentId: string, version: string): Promise<ComponentVersion | null>;
  getDependencies(componentId: string): Promise<ComponentDependency[]>;
  getDependents(componentId: string): Promise<ComponentDependency[]>;
  getCategories(): Promise<ComponentCategory[]>;
  install(componentId: string, projectId: string, version?: string, config?: Record<string, unknown>): Promise<ComponentInstall>;
  uninstall(componentId: string, projectId: string): Promise<void>;
  getInstalledByProject(projectId: string): Promise<ComponentInstall[]>;
}
