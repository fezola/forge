import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IWorkflowRepository } from '../domain/workflow.repository.interface';
import { WorkflowEntity } from '../domain/workflow.entity';
import { WorkflowGraph, WorkflowVariable, WorkflowTrigger } from '@forge/workflow-types';

@Injectable()
export class WorkflowService {
  constructor(
    @Inject('IWorkflowRepository')
    private readonly repo: IWorkflowRepository,
  ) {}

  async create(projectId: string, input: { name: string; description?: string }) {
    const workflow = WorkflowEntity.create({ projectId, ...input });
    return this.repo.create(workflow);
  }

  async list(projectId: string) {
    const workflows = await this.repo.findByProject(projectId);
    return workflows.map(w => ({
      id: w.id,
      projectId: w.projectId,
      name: w.name,
      description: w.description,
      version: w.version,
      status: w.status,
      nodeCount: w.graph.nodes.length,
      triggerType: w.triggerType,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    }));
  }

  async get(id: string) {
    const workflow = await this.repo.findById(id);
    if (!workflow) throw new NotFoundException('Workflow not found');
    return workflow;
  }

  async update(id: string, input: { name?: string; description?: string; graph?: WorkflowGraph; variables?: WorkflowVariable[]; trigger?: WorkflowTrigger }) {
    const workflow = await this.repo.findById(id);
    if (!workflow) throw new NotFoundException('Workflow not found');
    workflow.update(input);
    return this.repo.update(workflow);
  }

  async publish(id: string) {
    const workflow = await this.repo.findById(id);
    if (!workflow) throw new NotFoundException('Workflow not found');
    workflow.publish();
    return this.repo.update(workflow);
  }

  async rollback(id: string) {
    const workflow = await this.repo.findById(id);
    if (!workflow) throw new NotFoundException('Workflow not found');
    workflow.rollback();
    return this.repo.update(workflow);
  }

  async archive(id: string) {
    const workflow = await this.repo.findById(id);
    if (!workflow) throw new NotFoundException('Workflow not found');
    workflow.archive();
    return this.repo.update(workflow);
  }

  async delete(id: string) {
    await this.repo.delete(id);
  }

  async duplicate(id: string) {
    const original = await this.repo.findById(id);
    if (!original) throw new NotFoundException('Workflow not found');
    const clone = WorkflowEntity.create({
      projectId: original.projectId,
      name: `${original.name} (copy)`,
      description: original.description,
    });
    clone.update({
      graph: original.graph,
      variables: original.variables,
      trigger: original.trigger,
    });
    return this.repo.create(clone);
  }
}
