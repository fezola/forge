import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IQueryExecutor } from '../domain/query-executor.interface';
import { QueryResult } from '@forge/types';

@Injectable()
export class PrismaQueryExecutor implements IQueryExecutor {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(databaseId: string, sql: string): Promise<QueryResult> {
    const start = Date.now();
    const result = await this.prisma.$queryRawUnsafe(sql);
    const duration = Date.now() - start;
    return {
      rows: result as Record<string, unknown>[],
      rowCount: Array.isArray(result) ? result.length : 0,
      fields: [],
      duration,
    };
  }

  async testConnection(databaseId: string): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
