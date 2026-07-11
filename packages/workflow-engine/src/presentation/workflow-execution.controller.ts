import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { WorkflowExecutionService } from '../application/workflow-execution.service';

@Controller('workflow-executions')
export class WorkflowExecutionController {
  constructor(private readonly executions: WorkflowExecutionService) {}

  @Post(':workflowId/execute')
  execute(
    @Param('workflowId') workflowId: string,
    @Body() input: { input?: Record<string, unknown>; triggeredBy?: string },
  ) {
    return this.executions.execute(workflowId, input?.input || {}, input?.triggeredBy || 'manual');
  }

  @Post('webhook/:path')
  webhook(@Param('path') path: string, @Body() payload: unknown) {
    return this.executions.executeByWebhook(path, payload);
  }

  @Post(':executionId/cancel')
  cancel(@Param('executionId') executionId: string) {
    return this.executions.cancelExecution(executionId);
  }

  @Get(':workflowId/validate')
  validate(@Param('workflowId') workflowId: string) {
    return this.executions.validate(workflowId);
  }
}
