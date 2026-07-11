import { Injectable, Inject, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import type { IIdentityRepository } from '../domain/identity.repository.interface';
import type { IAuthProviderRegistry } from '../domain/auth-provider-registry.interface';
import {
  AuthCredentials, AuthResult, UpdateIdentity,
  IdentityEventType, IdentityProvider, ForgeIdentity, IdentitySummary,
} from '@forge/identity-types';
import { IdentityEntity } from '../domain/identity.entity';

interface ITokenService {
  generateAccessToken(payload: { sub: string; projectId: string; email?: string; roles: string[]; permissions: string[] }): { accessToken: string; refreshToken: string; expiresIn: number };
}

interface ISessionService {
  create(identityId: string, projectId: string, meta: { ipAddress: string; userAgent: string; deviceInfo: Record<string, unknown> }): Promise<{ id: string }>;
  revokeAll(identityId: string, exceptSessionId?: string): Promise<void>;
}

interface IIdentityEventBus {
  emit(payload: { type: IdentityEventType; projectId: string; identityId: string; data: Record<string, unknown>; source: 'api' }): Promise<unknown>;
}

@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);

  constructor(
    @Inject('IIdentityRepository')
    private readonly identityRepository: IIdentityRepository,
    @Inject('IAuthProviderRegistry')
    private readonly authProviderRegistry: IAuthProviderRegistry,
  ) {}

  async authenticate(
    projectId: string,
    credentials: AuthCredentials,
    sessionMeta: { ipAddress: string; userAgent: string; deviceInfo: Record<string, unknown> },
    sessionService: ISessionService,
    tokenService: ITokenService,
    eventBus: IIdentityEventBus,
  ): Promise<AuthResult> {
    const providerType = this.getProviderType(credentials);
    const providerResult = await this.authProviderRegistry.authenticate(providerType, credentials);

    const existingIdentity = await this.identityRepository.findByProvider(
      providerResult.provider,
      providerResult.providerUserId,
    );

    let identity: IdentityEntity;
    let isNewUser = false;

    if (existingIdentity) {
      identity = existingIdentity;
      if (identity.status !== 'active') {
        throw new ForbiddenException(`Identity is ${identity.status}`);
      }
      identity.recordLogin();
      await this.identityRepository.updateInternal(identity.id, {
        lastLoginAt: identity.lastLoginAt!,
        providers: identity.providers,
      });
    } else {
      identity = IdentityEntity.create({
        projectId,
        displayName: providerResult.displayName ?? 'User',
        email: providerResult.email,
        avatarUrl: providerResult.avatarUrl,
        metadata: providerResult.metadata,
      });
      identity.addProvider(providerResult.provider);
      await this.identityRepository.create({
        projectId,
        displayName: identity.displayName,
        email: identity.primaryEmail ?? undefined,
        avatarUrl: identity.avatarUrl ?? undefined,
        metadata: identity.metadata,
      });
      isNewUser = true;
    }

    const tokens = tokenService.generateAccessToken({
      sub: identity.id,
      projectId: identity.projectId,
      email: identity.primaryEmail ?? undefined,
      roles: identity.roles,
      permissions: identity.permissions,
    });

    const session = await sessionService.create(identity.id, projectId, {
      ipAddress: sessionMeta.ipAddress,
      userAgent: sessionMeta.userAgent,
      deviceInfo: sessionMeta.deviceInfo,
    });

    await this.emitEvent(eventBus, isNewUser ? 'identity.created' : 'identity.login', identity, {
      provider: providerResult.provider,
      providerUserId: providerResult.providerUserId,
      isNewUser,
      sessionId: session.id,
    });

    return {
      identity,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      sessionId: session.id,
      isNewUser,
      linkedProviders: identity.providers,
    };
  }

  async getByIdentity(id: string): Promise<IdentityEntity | null> {
    return this.identityRepository.findById(id);
  }

  async getProfile(id: string): Promise<ForgeIdentity | null> {
    const entity = await this.identityRepository.findById(id);
    return entity ?? null;
  }

  async update(id: string, data: UpdateIdentity): Promise<void> {
    const entity = await this.identityRepository.findById(id);
    if (!entity) throw new UnauthorizedException('Identity not found');
    entity.update(data as any);
    await this.identityRepository.updateInternal(id, {
      displayName: entity.displayName,
      avatarUrl: entity.avatarUrl,
      status: entity.status,
      settings: entity.settings,
      metadata: entity.metadata,
    });
  }

  async deleteIdentity(id: string): Promise<void> {
    const entity = await this.identityRepository.findById(id);
    if (!entity) throw new UnauthorizedException('Identity not found');
    await this.identityRepository.delete(id);
  }

  async list(projectId: string, offset = 0, limit = 50): Promise<{ items: IdentitySummary[]; total: number }> {
    return this.identityRepository.findByProject(projectId, offset, limit);
  }

  private getProviderType(credentials: AuthCredentials): IdentityProvider {
    switch (credentials.type) {
      case 'email_password': return 'email';
      case 'oauth': return credentials.provider;
      case 'wallet_signature': return 'wallet';
      case 'passkey': return 'passkey';
      case 'magic_link': return 'email';
      case 'otp': return 'email';
      case 'saml': return 'saml';
      case 'oidc': return 'oidc';
    }
  }

  private async emitEvent(eventBus: IIdentityEventBus, type: IdentityEventType, identity: IdentityEntity, data: Record<string, unknown>): Promise<void> {
    try {
      await eventBus.emit({
        type,
        projectId: identity.projectId,
        identityId: identity.id,
        data,
        source: 'api',
      });
    } catch (e) {
      this.logger.warn(`Failed to emit identity event ${type}: ${(e as Error).message}`);
    }
  }
}