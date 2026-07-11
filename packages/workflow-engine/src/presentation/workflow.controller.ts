import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { WorkflowService } from '../application/workflow.service';
import { WorkflowExecutionService } from '../application/workflow-execution.service';
import { NodeRegistryService } from '../application/node-registry.service';

@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly workflows: WorkflowService,
    private readonly executions: WorkflowExecutionService,
    private readonly nodeRegistry: NodeRegistryService,
  ) {}

  @Post()
  create(@Body() input: { projectId: string; name: string; description?: string }) {
    return this.workflows.create(input);
  }

  @Get()
  list(@Query('projectId') projectId: string) {
    return this.workflows.list(projectId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.workflows.get(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() input: any) {
    return this.workflows.update(id, input);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.workflows.delete(id);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.workflows.publish(id);
  }

  @Post(':id/rollback')
  rollback(@Param('id') id: string) {
    return this.workflows.rollback(id);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.workflows.duplicate(id);
  }

  @Get('node-templates')
  getNodeTemplates() {
    return this.nodeRegistry.getAll();
  }
}
