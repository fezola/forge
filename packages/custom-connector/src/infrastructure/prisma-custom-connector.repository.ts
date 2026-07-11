import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ICustomConnectorRepository } from '../domain/custom-connector.repository.interface';
import { CustomConnectorEntity } from '../domain/custom-connector.entity';

@Injectable()
export class PrismaCustomConnectorRepository implements ICustomConnectorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<CustomConnectorEntity | null> {
    return this.prisma.customConnector.findUnique({ where: { id } }) as any;
  }

  async findByProject(projectId: string): Promise<CustomConnectorEntity[]> {
    return this.prisma.customConnector.findMany({ where: { projectId } }) as any;
  }

  async create(entity: CustomConnectorEntity): Promise<CustomConnectorEntity> {
    return this.prisma.customConnector.create({ data: entity as any }) as any;
  }

  async update(id: string, data: Partial<CustomConnectorEntity>): Promise<CustomConnectorEntity> {
    return this.prisma.customConnector.update({ where: { id }, data: data as any }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.customConnector.delete({ where: { id } });
  }
}
