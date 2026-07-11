import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { ConnectorFacade } from '../application/connector.facade';

@Controller('custom-connectors')
export class ConnectorsController {
  constructor(private readonly facade: ConnectorFacade) {}

  @Post()
  create(@Body() input: { projectId: string; name: string; description?: string; authConfig: any; baseUrl: string; globalHeaders?: Record<string, string> }) {
    return this.facade.createCustom(input as any);
  }

  @Get()
  listCustom(@Query('projectId') projectId: string) {
    return this.facade.listCustom(projectId);
  }

  @Get(':id')
  getCustom(@Param('id') id: string) {
    return this.facade.getCustom(id);
  }

  @Delete(':id')
  deleteCustom(@Param('id') id: string) {
    return this.facade.deleteCustom(id);
  }

  @Post(':id/endpoints')
  addEndpoint(@Param('id') id: string, @Body() input: any) {
    return this.facade.addCustomEndpoint(id, input);
  }

  @Post(':id/mappings')
  addMapping(@Param('id') id: string, @Body() input: any) {
    return this.facade.addCustomMapping(id, input);
  }

  @Get(':id/manifest')
  generateManifest(@Param('id') id: string) {
    return this.facade.generateCustomManifest(id);
  }

  @Post('test-endpoint')
  testEndpoint(@Body() input: { baseUrl: string; method: string; path: string; headers?: Record<string, string>; body?: unknown; authConfig?: any }) {
    return this.facade.testEndpoint(input as any);
  }
}
