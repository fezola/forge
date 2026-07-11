import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { BindingService } from '../application/binding.service';
import { ResolveBindingsRequest } from '@forge/reactive-types';

@Controller('bindings')
export class BindingController {
  constructor(private readonly bindings: BindingService) {}

  @Post()
  create(@Body() input: { projectId: string; name: string; source: any; targetComponentId?: string; targetProperty?: string; transform?: Record<string, unknown>; fallback?: string }) {
    return this.bindings.create(input);
  }

  @Get()
  list(@Query('projectId') projectId: string) {
    return this.bindings.list(projectId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.bindings.get(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() input: any) {
    return this.bindings.update(id, input);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.bindings.delete(id);
  }

  @Post('resolve')
  resolveAll(@Body() input: ResolveBindingsRequest) {
    return this.bindings.resolveAll(input);
  }

  @Post(':id/resolve')
  resolve(@Param('id') id: string, @Body() input: { context?: Record<string, unknown> }) {
    return this.bindings.resolve(id, input?.context);
  }
}
