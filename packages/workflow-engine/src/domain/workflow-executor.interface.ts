import { WorkflowEntity } from './workflow.entity';
import { WorkflowRunResult, WorkflowVariable } from '@forge/workflow-types';

export interface IWorkflowExecutor {
  execute(workflow: WorkflowEntity, input: Record<string, unknown>, triggeredBy: string): Promise<WorkflowRunResult>;
  validate(workflow: WorkflowEntity): Promise<{ valid: boolean; errors: string[] }>;
  cancel(executionId: string): Promise<void>;
}
