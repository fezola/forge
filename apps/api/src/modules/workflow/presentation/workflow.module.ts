import { Module } from '@nestjs/common';
import { WorkflowEngineModule } from '@forge/workflow-engine';
import { WorkflowController } from './workflow.controller';
import { WorkflowFacade } from '../application/workflow.facade';

@Module({
  imports: [WorkflowEngineModule],
  controllers: [WorkflowController],
  providers: [WorkflowFacade],
  exports: [WorkflowFacade],
})
export class WorkflowModule {}
