import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AiFacade } from '../application/ai-facade';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiFacade) {}

  @Get('models')
  async listModels(@Query('provider') provider?: string) {
    return this.ai.getModels(provider);
  }

  @Get('models/:id')
  async getModel(@Param('id') id: string) {
    return this.ai.getModel(id);
  }

  @Post('models')
  async createModel(@Body() data: any) {
    return this.ai.createModel(data);
  }

  @Get('prompts')
  async listPrompts(@Query('projectId') projectId?: string) {
    return this.ai.getPrompts(projectId);
  }

  @Get('prompts/:id')
  async getPrompt(@Param('id') id: string) {
    return this.ai.getPrompt(id);
  }

  @Post('prompts')
  async createPrompt(@Body() data: any) {
    return this.ai.createPrompt(data);
  }

  @Put('prompts/:id')
  async updatePrompt(@Param('id') id: string, @Body() data: any) {
    return this.ai.updatePrompt(id, data);
  }

  @Delete('prompts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePrompt(@Param('id') id: string) {
    await this.ai.deletePrompt(id);
  }

  @Get('completions')
  async listCompletions(@Query('projectId') projectId?: string) {
    return this.ai.getCompletions(projectId);
  }

  @Get('completions/:id')
  async getCompletion(@Param('id') id: string) {
    return this.ai.getCompletion(id);
  }

  @Get('rag')
  async listRagSources(@Query('projectId') projectId?: string) {
    return this.ai.getRagSources(projectId);
  }

  @Get('agents')
  async listAgents(@Query('projectId') projectId?: string) {
    return this.ai.getAgents(projectId);
  }

  @Get('agents/:id')
  async getAgent(@Param('id') id: string) {
    return this.ai.getAgent(id);
  }

  @Post('agents')
  async createAgent(@Body() data: any) {
    return this.ai.createAgent(data);
  }

  @Put('agents/:id')
  async updateAgent(@Param('id') id: string, @Body() data: any) {
    return this.ai.updateAgent(id, data);
  }

  @Delete('agents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAgent(@Param('id') id: string) {
    await this.ai.deleteAgent(id);
  }
}
