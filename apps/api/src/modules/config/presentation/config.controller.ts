import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ConfigService, SecretService, FeatureFlagService,
  EnvironmentService, BrandService, AuditService,
} from '@forge/config-engine';
import type {
  CreateConfigInput, UpdateConfigInput, SetConfigValueInput,
  CreateFeatureFlagInput, UpdateFeatureFlagInput,
  CreateEnvironmentInput, UpdateEnvironmentInput,
  BrandConfigInput, BlockchainConfigInput, AiConfigInput,
  ConfigFilter,
} from '@forge/config-types';

@ApiTags('Configuration')
@Controller('config')
export class ConfigController {
  constructor(
    private readonly configService: ConfigService,
    private readonly secretService: SecretService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly environmentService: EnvironmentService,
    private readonly brandService: BrandService,
    private readonly auditService: AuditService,
  ) {}

  // ── Config Entries ──

  @Post()
  async createConfig(@Body() input: CreateConfigInput) {
    return this.configService.create(input, 'system');
  }

  @Get()
  async listConfigs(@Query() filter: ConfigFilter) {
    return this.configService.find(filter);
  }

  @Get(':id')
  async getConfig(@Param('id') id: string) {
    return this.configService.get(id);
  }

  @Put(':id')
  async updateConfig(@Param('id') id: string, @Body() input: UpdateConfigInput) {
    return this.configService.update(id, input, 'system');
  }

  @Delete(':id')
  async deleteConfig(@Param('id') id: string) {
    return this.configService.delete(id, 'system');
  }

  // ── Config Values ──

  @Post(':id/values')
  async setConfigValue(@Param('id') id: string, @Body() input: SetConfigValueInput) {
    return this.configService.setValue(id, input, 'system');
  }

  @Get(':id/values')
  async getConfigValues(@Param('id') id: string, @Query('environmentId') environmentId: string) {
    return this.configService.getValue(id, environmentId);
  }

  @Get(':id/resolve')
  async resolveConfigValue(@Param('id') id: string, @Query('environmentId') environmentId: string) {
    return this.configService.resolve(id, environmentId);
  }

  @Get('resolve')
  async resolveByKey(@Query('key') key: string, @Query('environmentId') environmentId: string, @Query('projectId') projectId?: string) {
    return this.configService.getResolvedValue(key, environmentId, projectId);
  }

  // ── Secrets ──

  @Post(':id/secrets')
  async createSecret(@Param('id') configId: string, @Body('value') value: string) {
    return this.secretService.create({ configId, value }, 'system');
  }

  @Get('secrets/:secretId')
  async getSecret(@Param('secretId') secretId: string) {
    return this.secretService.read(secretId, 'system');
  }

  @Post('secrets/:secretId/rotate')
  async rotateSecret(@Param('secretId') secretId: string, @Body('newValue') newValue: string) {
    return this.secretService.rotate(secretId, { newValue }, 'system');
  }

  @Post('secrets/:secretId/revoke')
  async revokeSecret(@Param('secretId') secretId: string) {
    return this.secretService.revoke(secretId, 'system');
  }

  // ── Feature Flags ──

  @Post('feature-flags')
  async createFlag(@Body() input: CreateFeatureFlagInput) {
    return this.featureFlagService.create(input, 'system');
  }

  @Get('feature-flags')
  async listFlags(@Query('projectId') projectId?: string) {
    return this.featureFlagService.list(projectId);
  }

  @Get('feature-flags/:id')
  async getFlag(@Param('id') id: string) {
    return this.featureFlagService.evaluate(id, {});
  }

  @Put('feature-flags/:id')
  async updateFlag(@Param('id') id: string, @Body() input: UpdateFeatureFlagInput) {
    return this.featureFlagService.update(id, input, 'system');
  }

  @Delete('feature-flags/:id')
  async deleteFlag(@Param('id') id: string) {
    return this.featureFlagService.delete(id, 'system');
  }

  @Post('feature-flags/:id/evaluate')
  async evaluateFlag(@Param('id') id: string, @Body() context: { identityId?: string; organizationId?: string; projectId?: string; environmentId?: string }) {
    return this.featureFlagService.evaluate(id, context);
  }

  // ── Environments ──

  @Post('environments')
  async createEnvironment(@Body() input: CreateEnvironmentInput) {
    return this.environmentService.create(input, 'system');
  }

  @Get('environments')
  async listEnvironments(@Query('projectId') projectId: string) {
    return this.environmentService.findByProject(projectId);
  }

  @Get('environments/:id')
  async getEnvironment(@Param('id') id: string) {
    return this.environmentService.findById(id);
  }

  @Put('environments/:id')
  async updateEnvironment(@Param('id') id: string, @Body() input: UpdateEnvironmentInput) {
    return this.environmentService.update(id, input);
  }

  @Delete('environments/:id')
  async deleteEnvironment(@Param('id') id: string) {
    return this.environmentService.delete(id, 'system');
  }

  @Post('environments/:id/snapshots')
  async createSnapshot(@Param('id') environmentId: string, @Body('label') label: string) {
    return this.environmentService.createSnapshot(environmentId, label, 'system');
  }

  // ── Brand ──

  @Get('brand/:projectId')
  async getBrand(@Param('projectId') projectId: string) {
    return this.brandService.getBrand(projectId);
  }

  @Put('brand/:projectId')
  async upsertBrand(@Param('projectId') projectId: string, @Body() input: BrandConfigInput) {
    return this.brandService.upsertBrand(projectId, input, 'system');
  }

  @Delete('brand/:projectId')
  async deleteBrand(@Param('projectId') projectId: string) {
    return this.brandService.deleteBrand(projectId, 'system');
  }

  // ── Blockchain Config ──

  @Get('blockchain/:projectId')
  async listBlockchainConfigs(@Param('projectId') projectId: string) {
    return this.brandService.getBlockchainConfigs(projectId);
  }

  @Post('blockchain/:projectId')
  async upsertBlockchainConfig(@Param('projectId') projectId: string, @Body() input: BlockchainConfigInput) {
    return this.brandService.upsertBlockchainConfig(projectId, input, 'system');
  }

  @Delete('blockchain/:id')
  async deleteBlockchainConfig(@Param('id') id: string) {
    return this.brandService.deleteBlockchainConfig(id);
  }

  // ── AI Config ──

  @Get('ai/:projectId')
  async listAiConfigs(@Param('projectId') projectId: string) {
    return this.brandService.getAiConfigs(projectId);
  }

  @Post('ai/:projectId')
  async upsertAiConfig(@Param('projectId') projectId: string, @Body() input: AiConfigInput) {
    return this.brandService.upsertAiConfig(projectId, input, 'system');
  }

  @Delete('ai/:id')
  async deleteAiConfig(@Param('id') id: string) {
    return this.brandService.deleteAiConfig(id);
  }

  // ── Audit ──

  @Get('audit')
  async listAudit(@Query('configId') configId?: string, @Query('projectId') projectId?: string, @Query('limit') limit?: number, @Query('offset') offset?: number) {
    if (configId) return this.auditService.findByConfig(configId, limit, offset);
    if (projectId) return this.auditService.findByProject(projectId, limit, offset);
    return this.auditService.findByAction('config.created', limit, offset);
  }
}