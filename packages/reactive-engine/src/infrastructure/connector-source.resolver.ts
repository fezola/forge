import { Injectable } from '@nestjs/common';
import { IDataSourceResolver } from '../domain/data-source.resolver.interface';
import { DataSourceType } from '@forge/reactive-types';
import { ConnectorRuntimeService } from '@forge/connector-runtime';

@Injectable()
export class ConnectorSourceResolver implements IDataSourceResolver {
  constructor(private readonly runtime: ConnectorRuntimeService) {}

  canResolve(type: DataSourceType): boolean {
    return type === 'connector.action';
  }

  async resolve(source: { type: DataSourceType; config: Record<string, unknown>; path?: string }, context: Record<string, unknown>): Promise<unknown> {
    const config = source.config as any;
    const result = await this.runtime.execute(
      config.installationId,
      config.actionId,
      config.input || {},
      config.projectId,
    );
    return result.data;
  }

  async resolveSchema(type: DataSourceType): Promise<{ fields: Array<{ name: string; type: string; path: string }> } | null> {
    return null;
  }
}
