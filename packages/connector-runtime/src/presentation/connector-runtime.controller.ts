import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ConnectorRuntimeService } from '../application/connector-runtime.service';
import { WorkflowExecutorService } from '../application/workflow-executor.service';

@Controller('runtime')
export class ConnectorRuntimeController {
  constructor(
    private readonly runtime: ConnectorRuntimeService,
    private readonly workflow: WorkflowExecutorService,
  ) {}

  @Post('execute')
  async execute(
    @Body() input: { installationId: string; actionId: string; input: Record<string, unknown>; projectId: string },
  ) {
    return this.runtime.execute(input.installationId, input.actionId, input.input, input.projectId);
  }

  @Post('test')
  async test(
    @Body() input: { baseUrl: string; method: string; path: string; headers?: Record<string, string>; body?: unknown },
  ) {
    return this.runtime.executeTest(input);
  }

  @Post('workflow')
  async workflow(
    @Body() input: { projectId: string; steps: Array<{ connectorId: string; actionId: string; input: Record<string, unknown> }> },
  ) {
    return this.workflow.executeWorkflow(input.projectId, input.steps);
  }

  @Get('health')
  async health() {
    return this.runtime.health();
  }

  @Get('validate/:installationId')
  async validate(@Param('installationId') id: string) {
    return { valid: await this.runtime.validate(id) };
  }
}
