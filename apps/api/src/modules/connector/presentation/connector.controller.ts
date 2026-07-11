import { Controller, Get, Post, Put, Delete, Patch, Param, Query, Body } from '@nestjs/common';
import { ConnectorFacade } from '../application/connector.facade';
import { ExecuteActionDto } from '../dto/execute-action.dto';

@Controller('connectors')
export class ConnectorController {
  constructor(private readonly facade: ConnectorFacade) {}

  @Get()
  list(@Query('projectId') projectId: string) {
    return this.facade.listInstalled(projectId);
  }

  @Get('available')
  listAvailable() {
    return this.facade.listAvailable();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.facade.getInstallation(id);
  }

  @Post(':manifestId/install')
  install(
    @Param('manifestId') manifestId: string,
    @Body() input: { projectId: string; config?: Record<string, unknown> },
  ) {
    return this.facade.install(input.projectId, manifestId, input.config);
  }

  @Delete(':id')
  uninstall(@Param('id') id: string) {
    return this.facade.uninstall(id);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @Body() input: { enabled: boolean }) {
    return this.facade.toggle(id, input.enabled);
  }

  @Put(':id/config')
  updateConfig(@Param('id') id: string, @Body() input: { config: Record<string, unknown> }) {
    return this.facade.updateConfig(id, input.config);
  }

  @Post('execute')
  execute(@Body() input: ExecuteActionDto) {
    return this.facade.execute(input.installationId, input.actionId, input.input, input.projectId);
  }

  @Post('workflow')
  executeWorkflow(@Body() input: { projectId: string; steps: Array<{ connectorId: string; actionId: string; input: Record<string, unknown> }> }) {
    return this.facade.executeWorkflow(input.projectId, input.steps);
  }
}
