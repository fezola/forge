import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { CustomConnectorService } from '../application/custom-connector.service';
import { EndpointTestService } from '../application/endpoint-test.service';
import { AuthConfig } from '@forge/connector-sdk';

@Controller('custom-connectors')
export class CustomConnectorController {
  constructor(
    private readonly service: CustomConnectorService,
    private readonly tester: EndpointTestService,
  ) {}

  @Post()
  create(@Body() input: { projectId: string; name: string; description?: string; authConfig: AuthConfig; baseUrl: string; globalHeaders?: Record<string, string> }) {
    return this.service.create(input);
  }

  @Get()
  list(@Query('projectId') projectId: string) {
    return this.service.list(projectId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() input: any) {
    return this.service.update(id, input);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/endpoints')
  addEndpoint(@Param('id') id: string, @Body() input: { name: string; description?: string; method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; path: string; requestHeaders?: Record<string, string>; requestBody?: Record<string, unknown> }) {
    return this.service.addEndpoint(id, input);
  }

  @Post(':id/mappings')
  addMapping(@Param('id') id: string, @Body() input: { fieldName: string; jsonPath: string; fieldType: 'string' | 'number' | 'boolean' | 'object' | 'array'; required?: boolean; defaultValue?: unknown }) {
    return this.service.addResponseMapping(id, input);
  }

  @Get(':id/manifest')
  generateManifest(@Param('id') id: string) {
    return this.service.generateManifest(id);
  }

  @Post('test-endpoint')
  testEndpoint(@Body() input: { baseUrl: string; method: string; path: string; headers?: Record<string, string>; body?: unknown; authConfig?: AuthConfig }) {
    return this.tester.testEndpoint(input);
  }
}
