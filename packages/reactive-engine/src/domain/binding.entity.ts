import { BindingSource } from '@forge/reactive-types';

export class BindingEntity {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public name: string,
    public source: BindingSource,
    public targetComponentId: string | null,
    public targetProperty: string | null,
    public transform: Record<string, unknown> | null,
    public fallback: string | null,
    public cacheTTL: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(input: {
    projectId: string;
    name: string;
    source: BindingSource;
    targetComponentId?: string;
    targetProperty?: string;
    transform?: Record<string, unknown>;
    fallback?: string;
    cacheTTL?: number;
  }): BindingEntity {
    return new BindingEntity(
      crypto.randomUUID(),
      input.projectId,
      input.name,
      input.source,
      input.targetComponentId || null,
      input.targetProperty || null,
      input.transform || null,
      input.fallback || null,
      input.cacheTTL || 0,
      new Date(),
      new Date(),
    );
  }

  update(input: Partial<Pick<BindingEntity, 'name' | 'source' | 'transform' | 'fallback' | 'cacheTTL'>>): void {
    if (input.name) this.name = input.name;
    if (input.source) this.source = input.source;
    if (input.transform) this.transform = input.transform;
    if (input.fallback !== undefined) this.fallback = input.fallback;
    if (input.cacheTTL) this.cacheTTL = input.cacheTTL;
    this.updatedAt = new Date();
  }
}
