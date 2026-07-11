import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ISecretRepository, SecretEntity } from '../domain/secret.repository.interface';

@Injectable()
export class PrismaSecretRepository implements ISecretRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<SecretEntity | null> {
    return this.prisma.secret.findUnique({ where: { id } }) as any;
  }

  async findByName(name: string, projectId?: string): Promise<SecretEntity | null> {
    return this.prisma.secret.findFirst({ where: { name, projectId } }) as any;
  }

  async findByProject(projectId: string): Promise<SecretEntity[]> {
    return this.prisma.secret.findMany({ where: { projectId } }) as any;
  }

  async findByConnector(connectorId: string): Promise<SecretEntity[]> {
    return this.prisma.secret.findMany({ where: { connectorId } }) as any;
  }

  async create(input: Partial<SecretEntity>): Promise<SecretEntity> {
    return this.prisma.secret.create({ data: input as any }) as any;
  }

  async update(id: string, data: Partial<SecretEntity>): Promise<SecretEntity> {
    return this.prisma.secret.update({ where: { id }, data }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.secret.delete({ where: { id } });
  }
}
