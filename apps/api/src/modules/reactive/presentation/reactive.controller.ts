import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ReactiveFacade } from '../application/reactive.facade';

@Controller('reactive')
export class ReactiveController {
  constructor(private readonly facade: ReactiveFacade) {}

  // --- Bindings ---
  @Post('bindings')
  createBinding(@Body() input: { projectId: string; name: string; source: any; targetComponentId?: string; targetProperty?: string; transform?: Record<string, unknown>; fallback?: string }) {
    return this.facade.createBinding(input);
  }

  @Get('bindings')
  listBindings(@Query('projectId') projectId: string) {
    return this.facade.listBindings(projectId);
  }

  @Get('bindings/:id')
  getBinding(@Param('id') id: string) {
    return this.facade.getBinding(id);
  }

  @Put('bindings/:id')
  updateBinding(@Param('id') id: string, @Body() input: any) {
    return this.facade.updateBinding(id, input);
  }

  @Delete('bindings/:id')
  deleteBinding(@Param('id') id: string) {
    return this.facade.deleteBinding(id);
  }

  @Post('bindings/resolve')
  resolveBindings(@Body() input: any) {
    return this.facade.resolveBindings(input);
  }

  @Post('bindings/:id/resolve')
  resolveBinding(@Param('id') id: string, @Body() input: { context?: Record<string, unknown> }) {
    return this.facade.resolveBinding(id, input?.context);
  }

  // --- Expressions ---
  @Post('expressions/evaluate')
  evaluateExpression(@Body() input: { expression: string; context: Record<string, unknown> }) {
    return this.facade.evaluateExpression(input.expression, input.context);
  }

  @Post('expressions/parse')
  parseExpression(@Body() input: { expression: string }) {
    return this.facade.parseExpression(input.expression);
  }

  // --- Queries ---
  @Post('queries/execute')
  executeQuery(@Body() input: any) {
    return this.facade.executeQuery(input);
  }

  // --- Data Sources ---
  @Get('sources')
  listSources(@Query('projectId') projectId: string) {
    return this.facade.listSources(projectId);
  }
}
