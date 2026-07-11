import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IDatabaseRepository } from '../domain/database.repository.interface';
import { Database, CreateDatabaseInput } from '@forge/types';

@Injectable()
export class PrismaDatabaseRepository implements IDatabaseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByProjectId(projectId: string): Promise<Database[]> {
    return this.prisma.database.findMany({ where: { projectId } }) as unknown as Database[];
  }

  async findById(id: string): Promise<Database | null> {
    return this.prisma.database.findUnique({ where: { id } }) as unknown as Database | null;
  }

  async create(projectId: string, input: CreateDatabaseInput): Promise<Database> {
    return this.prisma.database.create({
      data: {
        name: input.name,
        engine: input.engine,
        url: input.url,
        projectId,
      },
    }) as unknown as Database;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.database.delete({ where: { id } });
  }
}
