import { Injectable, Inject } from '@nestjs/common';
import { IDataSourceResolver } from '../domain/data-source.resolver.interface';
import { DataSourceType } from '@forge/reactive-types';

@Injectable()
export class SourceResolverService {
  private resolvers: Map<string, IDataSourceResolver> = new Map();

  register(type: string, resolver: IDataSourceResolver): void {
    this.resolvers.set(type, resolver);
  }

  async resolve(type: DataSourceType | string, config: Record<string, unknown>, context: Record<string, unknown>): Promise<unknown> {
    for (const [, resolver] of this.resolvers) {
      if (resolver.canResolve(type as DataSourceType)) {
        return resolver.resolve({ type: type as DataSourceType, config }, context);
      }
    }
    throw new Error(`No resolver registered for source type: ${type}`);
  }

  async resolveWithPath(source: { type: string; config: Record<string, unknown>; path?: string }, context: Record<string, unknown>): Promise<unknown> {
    const data = await this.resolve(source.type as DataSourceType, source.config, context);
    if (!source.path || !source.path.length) return data;
    return this.getDeepValue(data as Record<string, unknown>, source.path);
  }

  private getDeepValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((acc: unknown, part) => (acc as Record<string, unknown>)?.[part], obj);
  }
}
