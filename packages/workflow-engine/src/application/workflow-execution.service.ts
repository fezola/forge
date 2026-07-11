import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IWorkflowRepository } from '../domain/workflow.repository.interface';
import { WorkflowRuntimeService } from './workflow-runtime.service';

@Injectable()
export class WorkflowExecutionService {
  constructor(
    @Inject('IWorkflowRepository')
    private readonly repo: IWorkflowRepository,
    private readonly runtime: WorkflowRuntimeService,
  ) {}

  async execute(id: string, input: Record<string, unknown>, triggeredBy: string = 'manual') {
    const workflow = await this.repo.findById(id);
    if (!workflow) throw new NotFoundException('Workflow not found');
    if (!workflow.isPublished) throw new Error('Cannot execute a draft workflow. Publish it first.');

    return this.runtime.execute(workflow, input, triggeredBy);
  }

  async executeByWebhook(path: string, payload: unknown) {
    const workflow = await this.repo.findByWebhookPath(path);
    if (!workflow) throw new NotFoundException('No workflow found for this webhook path');

    return this.runtime.execute(workflow, payload as Record<string, unknown>, 'webhook');
  }

  async cancelExecution(executionId: string) {
    await this.runtime.cancel(executionId);
  }

  async validate(id: string) {
    const workflow = await this.repo.findById(id);
    if (!workflow) throw new NotFoundException('Workflow not found');
    return this.runtime.validate(workflow);
  }
}
