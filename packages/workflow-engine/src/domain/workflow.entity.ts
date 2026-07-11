import { WorkflowGraph, WorkflowVariable, WorkflowTrigger } from '@forge/workflow-types';

export type WorkflowStatus = 'draft' | 'published' | 'archived';

export class WorkflowEntity {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public name: string,
    public description: string,
    public version: number,
    public status: WorkflowStatus,
    public readonly graph: WorkflowGraph,
    public variables: WorkflowVariable[],
    public trigger: WorkflowTrigger,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public publishedAt: Date | null,
  ) {}

  static create(input: {
    projectId: string;
    name: string;
    description?: string;
  }): WorkflowEntity {
    return new WorkflowEntity(
      crypto.randomUUID(),
      input.projectId,
      input.name,
      input.description || '',
      1,
      'draft',
      { nodes: [], edges: [] },
      [],
      { type: 'manual', webhook: {} },
      new Date(),
      new Date(),
      null,
    );
  }

  update(input: { name?: string; description?: string; graph?: WorkflowGraph; variables?: WorkflowVariable[]; trigger?: WorkflowTrigger }): void {
    if (input.name) this.name = input.name;
    if (input.description !== undefined) this.description = input.description;
    if (input.graph) this.graph = input.graph;
    if (input.variables) this.variables = input.variables;
    if (input.trigger) this.trigger = input.trigger;
    this.updatedAt = new Date();
  }

  publish(): void {
    this.status = 'published';
    this.version++;
    this.publishedAt = new Date();
    this.updatedAt = new Date();
  }

  rollback(): void {
    if (this.version > 1) {
      this.version--;
    }
    this.status = 'draft';
    this.updatedAt = new Date();
  }

  archive(): void {
    this.status = 'archived';
    this.updatedAt = new Date();
  }

  get triggerType(): string {
    return this.trigger?.type || 'manual';
  }

  get isPublished(): boolean {
    return this.status === 'published';
  }
}
