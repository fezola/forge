import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IBindingRepository } from '../domain/binding.repository.interface';
import { BindingEntity } from '../domain/binding.entity';
import { SourceResolverService } from './source-resolver.service';
import { ExpressionEvaluatorService } from './expression-evaluator.service';
import { ReactiveStateService } from './reactive-state.service';
import { BindingSource, BindingResult, ResolveBindingsRequest } from '@forge/reactive-types';

@Injectable()
export class BindingService {
  constructor(
    @Inject('IBindingRepository')
    private readonly repo: IBindingRepository,
    private readonly sourceResolver: SourceResolverService,
    private readonly expressionEvaluator: ExpressionEvaluatorService,
    private readonly state: ReactiveStateService,
  ) {}

  async create(input: { projectId: string; name: string; source: BindingSource; targetComponentId?: string; targetProperty?: string; transform?: Record<string, unknown>; fallback?: string }) {
    const entity = BindingEntity.create(input);
    return this.repo.create(entity);
  }

  async list(projectId: string) {
    return this.repo.findByProject(projectId);
  }

  async get(id: string) {
    const binding = await this.repo.findById(id);
    if (!binding) throw new NotFoundException('Binding not found');
    return binding;
  }

  async update(id: string, input: Partial<{ name: string; source: BindingSource; transform: Record<string, unknown>; fallback: string }>) {
    const binding = await this.repo.findById(id);
    if (!binding) throw new NotFoundException('Binding not found');
    binding.update(input);
    return this.repo.update(binding);
  }

  async delete(id: string) {
    await this.repo.delete(id);
  }

  async resolve(bindingId: string, context?: Record<string, unknown>): Promise<BindingResult> {
    const binding = await this.repo.findById(bindingId);
    if (!binding) throw new NotFoundException('Binding not found');

    return this.resolveSource(binding.source, binding.transform, context || {}, binding.fallback);
  }

  async resolveAll(request: ResolveBindingsRequest): Promise<{ results: BindingResult[] }> {
    const results: BindingResult[] = [];
    for (const b of request.bindings) {
      try {
        const result = await this.resolveSource(
          b.source as BindingSource,
          b.transform as Record<string, unknown> | null,
          request.context || {},
          undefined,
        );
        results.push({ ...result, id: b.id });
      } catch (error: any) {
        results.push({
          id: b.id,
          success: false,
          value: null,
          resolved: false,
          source: JSON.stringify(b.source),
          error: error.message,
          cached: false,
          timestamp: new Date().toISOString(),
        } as any);
      }
    }
    return { results };
  }

  private async resolveSource(
    source: BindingSource,
    transforms: Record<string, unknown> | null,
    context: Record<string, unknown>,
    fallback: string | null,
  ): Promise<BindingResult> {
    const timestamp = new Date().toISOString();
    const sourceKey = `${source.type}:${JSON.stringify(source.config)}`;

    const cached = this.state.get('_cache', sourceKey);
    if (cached) {
      return { ...(cached as BindingResult), cached: true, timestamp };
    }

    try {
      let value = await this.sourceResolver.resolve(source.type, source.config, context);

      if (source.path && value) {
        value = this.getNestedValue(value as Record<string, unknown>, source.path);
      }

      if (transforms && transforms.expression) {
        const evaluated = await this.expressionEvaluator.evaluate(transforms.expression as string, { value, ...context });
        value = evaluated.value;
      }

      this.state.set('_cache', sourceKey, value);
      if (source.cacheTTL) {
        setTimeout(() => this.state.set('_cache', sourceKey, null), (source.cacheTTL as number) * 1000);
      }

      return {
        success: true,
        value: value ?? fallback,
        resolved: value !== undefined && value !== null,
        source: JSON.stringify(source),
        error: undefined,
        cached: false,
        timestamp,
      };
    } catch (error: any) {
      return {
        success: false,
        value: fallback || null,
        resolved: false,
        source: JSON.stringify(source),
        error: error.message,
        cached: false,
        timestamp,
      };
    }
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((acc: unknown, part) => (acc as Record<string, unknown>)?.[part], obj);
  }
}
