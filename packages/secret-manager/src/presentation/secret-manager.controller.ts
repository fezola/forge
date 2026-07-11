import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { SecretManagerService } from '../application/secret-manager.service';

@Controller('secrets')
export class SecretManagerController {
  constructor(private readonly secrets: SecretManagerService) {}

  @Post()
  create(@Body() input: { name: string; value: string; providerId: string; projectId?: string; connectorId?: string }) {
    return this.secrets.create(input);
  }

  @Get()
  list(@Query('projectId') projectId: string) {
    return this.secrets.list(projectId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.secrets.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() input: { value: string }) {
    return this.secrets.update(id, input.value);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.secrets.delete(id);
  }
}
