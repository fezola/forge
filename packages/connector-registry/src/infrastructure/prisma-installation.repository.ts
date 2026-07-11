import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IInstallationRepository } from '../domain/installation.repository.interface';
import { ConnectorInstallationEntity } from '../domain/connector-installation.entity';

@Injectable()
export class PrismaInstallationRepository implements IInstallationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ConnectorInstallationEntity | null> {
    return this.prisma.connectorInstallation.findUnique({ where: { id } }) as any;
  }

  async findByProject(projectId: string): Promise<ConnectorInstallationEntity[]> {
    return this.prisma.connectorInstallation.findMany({ where: { projectId } }) as any;
  }

  async findByName(projectId: string, name: string): Promise<ConnectorInstallationEntity | null> {
    return this.prisma.connectorInstallation.findFirst({ where: { projectId, name } }) as any;
  }

  async findByCategory(projectId: string, category: string): Promise<ConnectorInstallationEntity[]> {
    return this.prisma.connectorInstallation.findMany({ where: { projectId, category } }) as any;
  }

  async create(input: Partial<ConnectorInstallationEntity>): Promise<ConnectorInstallationEntity> {
    return this.prisma.connectorInstallation.create({ data: input as any }) as any;
  }

  async update(id: string, data: Partial<ConnectorInstallationEntity>): Promise<ConnectorInstallationEntity> {
    return this.prisma.connectorInstallation.update({ where: { id }, data }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.connectorInstallation.delete({ where: { id } });
  }

  async countByProject(projectId: string): Promise<number> {
    return this.prisma.connectorInstallation.count({ where: { projectId } });
  }
}
