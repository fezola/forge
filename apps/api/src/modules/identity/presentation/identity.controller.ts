import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { IdentityService, OrganizationService, RoleService, SessionService, WalletService, MfaService } from '@forge/identity-engine';
import { AuthCredentials, CreateOrganizationRequest, UpdateOrganization, UpdateIdentity, LinkWalletRequest, InviteMemberRequest } from '@forge/identity-types';

@ApiTags('Identity')
@Controller('identity')
export class IdentityController {
  constructor(
    private readonly identityService: IdentityService,
    private readonly orgService: OrganizationService,
    private readonly roleService: RoleService,
    private readonly sessionService: SessionService,
    private readonly walletService: WalletService,
    private readonly mfaService: MfaService,
  ) {}

  // === Auth ===

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() input: { projectId: string; credentials: any }) {
    return this.identityService.authenticate(
      input.projectId,
      input.credentials,
      { ipAddress: '', userAgent: '', deviceInfo: {} },
      this.sessionService as any,
      null as any,
      null as any,
    );
  }

  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() input: { sessionId: string }) {
    const session = await this.sessionService.refresh(input.sessionId);
    return { accessToken: session.accessToken, refreshToken: session.refreshToken };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('auth/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() input: { sessionId: string }) {
    await this.sessionService.revoke(input.sessionId);
  }

  // === Profile ===

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.identityService.getProfile(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@CurrentUser('id') userId: string, @Body() input: UpdateIdentity) {
    return this.identityService.update(userId, input);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@CurrentUser('id') userId: string) {
    await this.identityService.deleteIdentity(userId);
  }

  // === Admin: Identity Management ===

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Query('projectId') projectId: string, @Query('offset') offset?: number, @Query('limit') limit?: number) {
    return this.identityService.list(projectId, offset, limit);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Param('id') id: string) {
    return this.identityService.getProfile(id);
  }

  // === Organizations ===

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('organizations')
  async getOrganizations(@CurrentUser('id') userId: string) {
    return this.orgService.getByIdentity(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('organizations/:id')
  async getOrganization(@Param('id') id: string) {
    return this.orgService.get(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('organizations')
  async createOrganization(@Body() input: CreateOrganizationRequest) {
    return this.orgService.create(input);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('organizations/:id')
  async updateOrganization(@Param('id') id: string, @Body() input: UpdateOrganization) {
    return this.orgService.update(id, input);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('organizations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrganization(@Param('id') id: string) {
    await this.orgService.delete(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('organizations/:orgId/members')
  async getMembers(@Param('orgId') orgId: string) {
    return this.orgService.getMembers(orgId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('organizations/:orgId/invites')
  async inviteMember(@CurrentUser('id') userId: string, @Param('orgId') orgId: string, @Body() input: { email: string; roleId: string }) {
    return this.orgService.invite({
      organizationId: orgId,
      email: input.email,
      roleId: input.roleId,
      invitedById: userId,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('invites/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvite(@CurrentUser('id') userId: string, @Body() input: { token: string }) {
    await this.orgService.acceptInvite(input.token, userId);
  }

  // === Wallets ===

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('wallets')
  async getWallets(@CurrentUser('id') userId: string) {
    return this.walletService.getByIdentity(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('wallets/link')
  async linkWallet(@CurrentUser('id') userId: string, @Body() input: Omit<LinkWalletRequest, 'identityId'>) {
    return this.walletService.link({ ...input, identityId: userId });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('wallets/:id/unlink')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkWallet(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.walletService.unlink(id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('wallets/:id/primary')
  @HttpCode(HttpStatus.OK)
  async setPrimaryWallet(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.walletService.setPrimary(id, userId);
  }

  // === Sessions ===

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@CurrentUser('id') userId: string) {
    return this.sessionService.getSummaries(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('sessions/:id/revoke')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSession(@Param('id') id: string) {
    await this.sessionService.revoke(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('sessions/revoke-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeAllSessions(@CurrentUser('id') userId: string) {
    await this.sessionService.revokeAll(userId);
  }

  // === MFA ===

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('mfa/enable')
  async enableMfa(@CurrentUser('id') userId: string, @Body() input: { method: string; config?: Record<string, unknown> }) {
    return this.mfaService.enable(input.method as any, userId, input.config);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('mfa/:id/disable')
  @HttpCode(HttpStatus.NO_CONTENT)
  async disableMfa(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.mfaService.disable(id, userId);
  }

  // === Roles ===

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('roles')
  async getRoles(@Query('projectId') projectId: string) {
    return this.roleService.getByProject(projectId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('roles/assign')
  @HttpCode(HttpStatus.OK)
  async assignRole(@Body() input: { identityId: string; roleId: string; organizationId?: string }) {
    await this.roleService.assignRole(input.identityId, input.roleId, input.organizationId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('roles/remove')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRole(@Body() input: { identityId: string; roleId: string; organizationId?: string }) {
    await this.roleService.removeRole(input.identityId, input.roleId, input.organizationId);
  }
}