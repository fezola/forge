import { WorkflowEntity } from './workflow.entity';

export interface IWorkflowRepository {
  findById(id: string): Promise<WorkflowEntity | null>;
  findByProject(projectId: string): Promise<WorkflowEntity[]>;
  findPublished(projectId: string): Promise<WorkflowEntity[]>;
  findPublishedByTrigger(triggerType: string): Promise<WorkflowEntity[]>;
  findByWebhookPath(path: string): Promise<WorkflowEntity | null>;
  create(workflow: WorkflowEntity): Promise<WorkflowEntity>;
  update(workflow: WorkflowEntity): Promise<WorkflowEntity>;
  delete(id: string): Promise<void>;
  countByProject(projectId: string): Promise<number>;
}
