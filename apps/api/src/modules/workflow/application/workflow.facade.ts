import { Injectable } from '@nestjs/common';
import { WorkflowService, WorkflowExecutionService, WorkflowRuntimeService } from '@forge/workflow-engine';

@Injectable()
export class WorkflowFacade {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly executionService: WorkflowExecutionService,
    private readonly runtimeService: WorkflowRuntimeService,
  ) {}

  async createWorkflow(projectId: string, name: string, description?: string) {
    return this.workflowService.create(projectId, { name, description });
  }

  async listWorkflows(projectId: string) {
    return this.workflowService.list(projectId);
  }

  async getWorkflow(id: string) {
    return this.workflowService.get(id);
  }

  async updateWorkflow(id: string, input: any) {
    return this.workflowService.update(id, input);
  }

  async deleteWorkflow(id: string) {
    return this.workflowService.delete(id);
  }

  async publishWorkflow(id: string) {
    return this.workflowService.publish(id);
  }

  async rollbackWorkflow(id: string) {
    return this.workflowService.rollback(id);
  }

  async duplicateWorkflow(id: string) {
    return this.workflowService.duplicate(id);
  }

  async executeWorkflow(id: string, input: Record<string, unknown>) {
    return this.executionService.execute(id, input);
  }

  async validateWorkflow(id: string) {
    return this.executionService.validate(id);
  }
}
