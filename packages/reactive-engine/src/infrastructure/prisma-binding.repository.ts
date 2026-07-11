import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IBindingRepository } from '../domain/binding.repository.interface';
import { BindingEntity } from '../domain/binding.entity';

@Injectable()
export class PrismaBindingRepository implements IBindingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<BindingEntity | null> {
    const row = await this.prisma.binding.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async findByProject(projectId: string): Promise<BindingEntity[]> {
    const rows = await this.prisma.binding.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
    return rows.map(r => this.toEntity(r));
  }

  async findByComponent(projectId: string, componentId: string): Promise<BindingEntity[]> {
    const rows = await this.prisma.binding.findMany({ where: { projectId, targetComponentId: componentId } });
    return rows.map(r => this.toEntity(r));
  }

  async create(entity: BindingEntity): Promise<BindingEntity> {
    const row = await this.prisma.binding.create({ data: this.toPrisma(entity) });
    return this.toEntity(row);
  }

  async update(entity: BindingEntity): Promise<BindingEntity> {
    const row = await this.prisma.binding.update({ where: { id: entity.id }, data: this.toPrisma(entity) });
    return this.toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.binding.delete({ where: { id } });
  }

  private toEntity(row: any): BindingEntity {
    return new BindingEntity(
      row.id,
      row.projectId,
      row.name,
      typeof row.source === 'string' ? JSON.parse(row.source) : row.source,
      row.targetComponentId,
      row.targetProperty,
      row.transform ? (typeof row.transform === 'string' ? JSON.parse(row.transform) : row.transform) : null,
      row.fallback,
      row.cacheTTL,
      new Date(row.createdAt),
      new Date(row.updatedAt),
    );
  }

  private toPrisma(entity: BindingEntity): any {
    return {
      id: entity.id,
      projectId: entity.projectId,
      name: entity.name,
      source: JSON.stringify(entity.source),
      targetComponentId: entity.targetComponentId,
      targetProperty: entity.targetProperty,
      transform: entity.transform ? JSON.stringify(entity.transform) : null,
      fallback: entity.fallback,
      cacheTTL: entity.cacheTTL,
    };
  }
}
