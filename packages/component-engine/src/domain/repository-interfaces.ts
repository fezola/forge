import type { Component, ComponentVersion, ComponentCategory, ComponentDependency, ComponentInstall } from '@forge/component-types';

export interface IComponentRepository {
  findAll(filters?: { type?: string; categoryId?: string; status?: string; isPublic?: boolean }): Promise<Component[]>;
  search(query: string): Promise<Component[]>;
  findById(id: string): Promise<Component | null>;
  findBySlug(slug: string): Promise<Component | null>;
  findByAuthor(authorId: string): Promise<Component[]>;
  create(data: { name: string; slug: string; description?: string; categoryId?: string; type?: string; framework?: string; authorId: string; authorName?: string; license?: string; tags?: string[]; isPublic?: boolean; metadata?: Record<string, unknown> }): Promise<Component>;
  update(id: string, data: Partial<Component>): Promise<Component>;
  publish(id: string): Promise<void>;
  deprecate(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  incrementInstallCount(id: string): Promise<void>;
}

export interface IVersionRepository {
  findByComponent(componentId: string): Promise<ComponentVersion[]>;
  findById(id: string): Promise<ComponentVersion | null>;
  findVersion(componentId: string, version: string): Promise<ComponentVersion | null>;
  getLatest(componentId: string): Promise<ComponentVersion | null>;
  create(data: { componentId: string; version: string; changelog?: string; packageUrl?: string; sourceUrl?: string; entryPoint?: string; dependencies?: string[]; peerDependencies?: string[]; sizeBytes?: number; checksum?: string; metadata?: Record<string, unknown> }): Promise<ComponentVersion>;
  publish(id: string): Promise<void>;
}

export interface ICategoryRepository {
  findAll(): Promise<ComponentCategory[]>;
  findById(id: string): Promise<ComponentCategory | null>;
  findBySlug(slug: string): Promise<ComponentCategory | null>;
  create(data: { name: string; slug: string; description?: string; icon?: string; sortOrder?: number; parentId?: string }): Promise<ComponentCategory>;
  update(id: string, data: Partial<ComponentCategory>): Promise<ComponentCategory>;
  delete(id: string): Promise<void>;
}

export interface IInstallRepository {
  findByProject(projectId: string): Promise<ComponentInstall[]>;
  findById(id: string): Promise<ComponentInstall | null>;
  findInstall(componentId: string, projectId: string): Promise<ComponentInstall | null>;
  create(data: { componentId: string; projectId: string; version: string; config?: Record<string, unknown>; installedBy: string }): Promise<ComponentInstall>;
  update(id: string, data: Partial<ComponentInstall>): Promise<ComponentInstall>;
  remove(id: string): Promise<void>;
}

export interface IDependencyRepository {
  findByComponent(componentId: string): Promise<ComponentDependency[]>;
  findDependents(componentId: string): Promise<ComponentDependency[]>;
  create(data: { componentId: string; dependentId: string; versionRange?: string; type?: string }): Promise<ComponentDependency>;
  remove(id: string): Promise<void>;
}
