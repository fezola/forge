import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IWorkflowRepository } from '../domain/workflow.repository.interface';
import { WorkflowEntity } from '../domain/workflow.entity';

@Injectable()
export class PrismaWorkflowRepository implements IWorkflowRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<WorkflowEntity | null> {
    const row = await this.prisma.workflow.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async findByProject(projectId: string): Promise<WorkflowEntity[]> {
    const rows = await this.prisma.workflow.findMany({ where: { projectId }, orderBy: { updatedAt: 'desc' } });
    return rows.map(r => this.toEntity(r));
  }

  async findPublished(projectId: string): Promise<WorkflowEntity[]> {
    const rows = await this.prisma.workflow.findMany({ where: { projectId, status: 'published' } });
    return rows.map(r => this.toEntity(r));
  }

  async findPublishedByTrigger(triggerType: string): Promise<WorkflowEntity[]> {
    const rows = await this.prisma.workflow.findMany({
      where: { status: 'published', trigger: { path: ['type'], equals: triggerType } },
    });
    return rows.map(r => this.toEntity(r));
  }

  async findByWebhookPath(path: string): Promise<WorkflowEntity | null> {
    const row = await this.prisma.workflow.findFirst({
      where: { status: 'published', webhookPath: path },
    });
    if (!row) return null;
    return this.toEntity(row);
  }

  async create(workflow: WorkflowEntity): Promise<WorkflowEntity> {
    const data = this.toPrisma(workflow);
    const row = await this.prisma.workflow.create({ data });
    return this.toEntity(row);
  }

  async update(workflow: WorkflowEntity): Promise<WorkflowEntity> {
    const data = this.toPrisma(workflow);
    const row = await this.prisma.workflow.update({ where: { id: workflow.id }, data });
    return this.toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workflow.delete({ where: { id } });
  }

  async countByProject(projectId: string): Promise<number> {
    return this.prisma.workflow.count({ where: { projectId } });
  }

  private toEntity(row: any): WorkflowEntity {
    return new WorkflowEntity(
      row.id,
      row.projectId,
      row.name,
      row.description || '',
      row.version,
      row.status,
      typeof row.graph === 'string' ? JSON.parse(row.graph) : row.graph,
      typeof row.variables === 'string' ? JSON.parse(row.variables) : (row.variables || []),
      typeof row.trigger === 'string' ? JSON.parse(row.trigger) : (row.trigger || { type: 'manual', webhook: {} }),
      new Date(row.createdAt),
      new Date(row.updatedAt),
      row.publishedAt ? new Date(row.publishedAt) : null,
    );
  }

  private toPrisma(entity: WorkflowEntity): any {
    return {
      id: entity.id,
      projectId: entity.projectId,
      name: entity.name,
      description: entity.description,
      version: entity.version,
      status: entity.status,
      graph: JSON.stringify(entity.graph),
      variables: JSON.stringify(entity.variables),
      trigger: JSON.stringify(entity.trigger),
      webhookPath: entity.trigger?.type === 'webhook' ? entity.trigger?.config?.path : null,
    };
  }
}
