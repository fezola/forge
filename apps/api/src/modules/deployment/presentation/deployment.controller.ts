import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { DeploymentFacade } from '../application/deployment-facade';

@ApiTags('Deployment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deployment')
export class DeploymentController {
  constructor(private readonly dep: DeploymentFacade) {}

  @Get('stats')
  async getStats() {
    return this.dep.getStats();
  }

  @Get('environments')
  async listEnvironments(@Query('projectId') projectId?: string) {
    return this.dep.getEnvironments(projectId);
  }

  @Get('environments/:id')
  async getEnvironment(@Param('id') id: string) {
    return this.dep.getEnvironment(id);
  }

  @Post('environments')
  async createEnvironment(@Body() data: any) {
    return this.dep.createEnvironment(data);
  }

  @Put('environments/:id')
  async updateEnvironment(@Param('id') id: string, @Body() data: any) {
    return this.dep.updateEnvironment(id, data);
  }

  @Delete('environments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEnvironment(@Param('id') id: string) {
    await this.dep.deleteEnvironment(id);
  }

  @Get('deployments')
  async listDeployments(@Query('environmentId') environmentId?: string, @Query('projectId') projectId?: string) {
    return this.dep.getDeployments(environmentId, projectId);
  }

  @Get('deployments/:id')
  async getDeployment(@Param('id') id: string) {
    return this.dep.getDeployment(id);
  }

  @Post('deployments')
  async createDeployment(@Body() data: any) {
    return this.dep.createDeployment(data);
  }

  @Put('deployments/:id')
  async updateDeployment(@Param('id') id: string, @Body() data: any) {
    return this.dep.updateDeployment(id, data);
  }

  @Post('deployments/:id/rollback')
  @HttpCode(HttpStatus.OK)
  async rollback(@Param('id') id: string) {
    return this.dep.rollback(id);
  }

  @Get('domains')
  async listDomains(@Query('environmentId') environmentId?: string) {
    return this.dep.getDomains(environmentId);
  }

  @Post('domains')
  async createDomain(@Body() data: any) {
    return this.dep.createDomain(data);
  }

  @Delete('domains/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDomain(@Param('id') id: string) {
    await this.dep.deleteDomain(id);
  }

  @Get('build-config/:environmentId')
  async getBuildConfig(@Param('environmentId') environmentId: string) {
    return this.dep.getBuildConfig(environmentId);
  }

  @Put('build-config/:environmentId')
  async upsertBuildConfig(@Param('environmentId') environmentId: string, @Body() data: any) {
    return this.dep.upsertBuildConfig(environmentId, data);
  }

  @Get('secrets/:environmentId')
  async listSecrets(@Param('environmentId') environmentId: string) {
    return this.dep.getSecrets(environmentId);
  }

  @Post('secrets')
  async createSecret(@Body() data: any) {
    return this.dep.createSecret(data);
  }

  @Put('secrets/:id')
  async updateSecret(@Param('id') id: string, @Body() data: any) {
    return this.dep.updateSecret(id, data);
  }

  @Delete('secrets/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSecret(@Param('id') id: string) {
    await this.dep.deleteSecret(id);
  }
}
