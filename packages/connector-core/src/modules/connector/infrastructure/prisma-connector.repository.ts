import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IConnectorRepository } from '../domain/connector.repository.interface';
import { Connector, CreateConnectorInput } from '@forge/types';

@Injectable()
export class PrismaConnectorRepository implements IConnectorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByProjectId(projectId: string): Promise<Connector[]> {
    return this.prisma.connector.findMany({ where: { projectId } }) as unknown as Connector[];
  }

  async findById(id: string): Promise<Connector | null> {
    return this.prisma.connector.findUnique({ where: { id } }) as unknown as Connector | null;
  }

  async create(projectId: string, input: CreateConnectorInput): Promise<Connector> {
    return this.prisma.connector.create({
      data: {
        name: input.name,
        type: input.type,
        config: input.config,
        projectId,
      },
    }) as unknown as Connector;
  }

  async update(id: string, input: Partial<CreateConnectorInput>): Promise<Connector> {
    return this.prisma.connector.update({
      where: { id },
      data: input,
    }) as unknown as Connector;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.connector.delete({ where: { id } });
  }
}
