import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { EnterpriseFacade } from '../application/enterprise-facade';

@ApiTags('Enterprise')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enterprise')
export class EnterpriseController {
  constructor(private readonly ent: EnterpriseFacade) {}

  @Get('stats')
  async getStats(@Query('projectId') projectId?: string) {
    return this.ent.getStats(projectId);
  }

  // ── SSO ──

  @Get('sso')
  async listSsoProviders(@Query('projectId') projectId?: string) {
    return this.ent.getSsoProviders(projectId);
  }

  @Get('sso/:id')
  async getSsoProvider(@Param('id') id: string) {
    return this.ent.getSsoProvider(id);
  }

  @Post('sso')
  async createSsoProvider(@Body() data: any) {
    return this.ent.createSsoProvider(data);
  }

  @Put('sso/:id')
  async updateSsoProvider(@Param('id') id: string, @Body() data: any) {
    return this.ent.updateSsoProvider(id, data);
  }

  @Delete('sso/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSsoProvider(@Param('id') id: string) {
    await this.ent.deleteSsoProvider(id);
  }

  @Get('sso/:id/domains')
  async listSsoDomains(@Param('id') id: string) {
    return this.ent.getSsoDomains(id);
  }

  @Post('sso/domains')
  async createSsoDomain(@Body() data: any) {
    return this.ent.createSsoDomain(data);
  }

  @Post('sso/domains/:id/verify')
  @HttpCode(HttpStatus.OK)
  async verifySsoDomain(@Param('id') id: string) {
    return this.ent.verifySsoDomain(id);
  }

  @Delete('sso/domains/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSsoDomain(@Param('id') id: string) {
    await this.ent.deleteSsoDomain(id);
  }

  @Put('sso/:id/saml')
  async upsertSamlConfig(@Param('id') id: string, @Body() data: any) {
    return this.ent.upsertSamlConfig(id, data);
  }

  @Put('sso/:id/oidc')
  async upsertOidcConfig(@Param('id') id: string, @Body() data: any) {
    return this.ent.upsertOidcConfig(id, data);
  }

  // ── RBAC ──

  @Get('roles')
  async listRoles(@Query('projectId') projectId?: string) {
    return this.ent.getRoles(projectId);
  }

  @Get('roles/:id')
  async getRole(@Param('id') id: string) {
    return this.ent.getRole(id);
  }

  @Post('roles')
  async createRole(@Body() data: any) {
    return this.ent.createRole(data);
  }

  @Put('roles/:id')
  async updateRole(@Param('id') id: string, @Body() data: any) {
    return this.ent.updateRole(id, data);
  }

  @Delete('roles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRole(@Param('id') id: string) {
    await this.ent.deleteRole(id);
  }

  @Get('roles/:id/permissions')
  async listPermissions(@Param('id') id: string) {
    return this.ent.getPermissions(id);
  }

  @Post('permissions')
  async createPermission(@Body() data: any) {
    return this.ent.createPermission(data);
  }

  @Delete('permissions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePermission(@Param('id') id: string) {
    await this.ent.deletePermission(id);
  }

  @Get('roles/:id/members')
  async listRoleMembers(@Param('id') id: string) {
    return this.ent.getRoleMembers(id);
  }

  @Post('role-members')
  async addRoleMember(@Body() data: any) {
    return this.ent.addRoleMember(data);
  }

  @Delete('role-members/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRoleMember(@Param('id') id: string) {
    await this.ent.removeRoleMember(id);
  }

  // ── Audit ──

  @Get('audit')
  async listAuditEvents(
    @Query('projectId') projectId?: string,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
    @Query('severity') severity?: string,
    @Query('actorId') actorId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.ent.getAuditEvents({ projectId, action, resourceType, severity, actorId, limit: limit ? parseInt(limit) : undefined, offset: offset ? parseInt(offset) : undefined });
  }

  @Get('audit/:id')
  async getAuditEvent(@Param('id') id: string) {
    return this.ent.getAuditEvent(id);
  }

  @Post('audit')
  async recordAuditEvent(@Body() data: any) {
    return this.ent.recordAuditEvent(data);
  }

  // ── Compliance ──

  @Get('compliance')
  async listComplianceReports(@Query('projectId') projectId?: string) {
    return this.ent.getComplianceReports(projectId);
  }

  @Get('compliance/:id')
  async getComplianceReport(@Param('id') id: string) {
    return this.ent.getComplianceReport(id);
  }

  @Post('compliance')
  async createComplianceReport(@Body() data: any) {
    return this.ent.createComplianceReport(data);
  }

  @Put('compliance/:id')
  async updateComplianceReport(@Param('id') id: string, @Body() data: any) {
    return this.ent.updateComplianceReport(id, data);
  }

  @Delete('compliance/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComplianceReport(@Param('id') id: string) {
    await this.ent.deleteComplianceReport(id);
  }

  // ── Enterprise Settings ──

  @Get('settings/:projectId')
  async getEnterpriseSettings(@Param('projectId') projectId: string) {
    return this.ent.getEnterpriseSettings(projectId);
  }

  @Put('settings/:projectId')
  async upsertEnterpriseSettings(@Param('projectId') projectId: string, @Body() data: any) {
    return this.ent.upsertEnterpriseSettings(projectId, data);
  }
}
