import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IDatabaseRepository } from '../domain/database.repository.interface';
import { IQueryExecutor } from '../domain/query-executor.interface';
import { CreateDatabaseInput, QueryResult } from '@forge/types';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject('IDatabaseRepository')
    private readonly databaseRepository: IDatabaseRepository,
    @Inject('IQueryExecutor')
    private readonly queryExecutor: IQueryExecutor,
  ) {}

  async list(projectId: string) {
    return this.databaseRepository.findByProjectId(projectId);
  }

  async get(id: string) {
    const db = await this.databaseRepository.findById(id);
    if (!db) throw new NotFoundException('Database not found');
    return db;
  }

  async create(projectId: string, input: CreateDatabaseInput) {
    return this.databaseRepository.create(projectId, input);
  }

  async delete(id: string) {
    await this.databaseRepository.delete(id);
  }

  async query(databaseId: string, sql: string): Promise<QueryResult> {
    const db = await this.databaseRepository.findById(databaseId);
    if (!db) throw new NotFoundException('Database not found');
    return this.queryExecutor.execute(databaseId, sql);
  }
}
