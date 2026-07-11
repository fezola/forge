import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { WorkflowFacade } from '../application/workflow.facade';

@Controller('workflows')
export class WorkflowController {
  constructor(private readonly facade: WorkflowFacade) {}

  @Post()
  create(@Body() input: { projectId: string; name: string; description?: string }) {
    return this.facade.createWorkflow(input.projectId, input.name, input.description);
  }

  @Get()
  list(@Query('projectId') projectId: string) {
    return this.facade.listWorkflows(projectId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.facade.getWorkflow(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() input: any) {
    return this.facade.updateWorkflow(id, input);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.facade.deleteWorkflow(id);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.facade.publishWorkflow(id);
  }

  @Post(':id/rollback')
  rollback(@Param('id') id: string) {
    return this.facade.rollbackWorkflow(id);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.facade.duplicateWorkflow(id);
  }

  @Post(':id/execute')
  execute(@Param('id') id: string, @Body() input: { input?: Record<string, unknown> }) {
    return this.facade.executeWorkflow(id, input?.input || {});
  }

  @Get(':id/validate')
  validate(@Param('id') id: string) {
    return this.facade.validateWorkflow(id);
  }
}
