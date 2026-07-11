import { Injectable } from '@nestjs/common';
import { IDataSourceResolver } from '../domain/data-source.resolver.interface';
import { DataSourceType } from '@forge/reactive-types';

@Injectable()
export class UserSourceResolver implements IDataSourceResolver {
  canResolve(type: DataSourceType): boolean {
    return type.startsWith('user.');
  }

  async resolve(source: { type: DataSourceType; config: Record<string, unknown>; path?: string }, context: Record<string, unknown>): Promise<unknown> {
    const user = context['user'] || {};
    const type = source.type;
    if (type === 'user.current') return user;
    if (type === 'user.profile') return (user as any)?.profile || user;
    if (type === 'user.session') return context['session'] || {};
    return user;
  }

  async resolveSchema(type: DataSourceType): Promise<{ fields: Array<{ name: string; type: string; path: string }> } | null> {
    return {
      fields: [
        { name: 'id', type: 'string', path: 'id' },
        { name: 'email', type: 'string', path: 'email' },
        { name: 'name', type: 'string', path: 'name' },
        { name: 'profile', type: 'object', path: 'profile' },
      ],
    };
  }
}
