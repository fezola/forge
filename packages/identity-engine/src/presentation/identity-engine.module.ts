import { Module, Global, OnModuleInit } from '@nestjs/common';
import { IdentityService } from '../application/identity.service';
import { OrganizationService } from '../application/organization.service';
import { RoleService } from '../application/role.service';
import { SessionService } from '../application/session.service';
import { MfaService } from '../application/mfa.service';
import { WalletService } from '../application/wallet.service';
import { PrismaIdentityRepository } from '../infrastructure/prisma-identity.repository';
import { PrismaOrganizationRepository } from '../infrastructure/prisma-organization.repository';
import { PrismaRoleRepository } from '../infrastructure/prisma-role.repository';
import { PrismaSessionStore } from '../infrastructure/prisma-session.store';
import { IdentityEventBus } from '../infrastructure/identity-event-bus';
import { AuthProviderRegistry } from '../infrastructure/auth-provider-registry';
import { IdentityWorkflowTrigger } from '../infrastructure/identity-workflow-trigger';
import { EmailPasswordProvider } from '../providers/email-password.provider';
import { OAuthProvider } from '../providers/oauth.provider';
import { WalletProvider } from '../providers/wallet.provider';
import { PasskeyProvider } from '../providers/passkey.provider';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaClient } from '@prisma/client';
import { IdentityProvider } from '@forge/identity-types';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true }),
  ],
  providers: [
    IdentityService,
    OrganizationService,
    RoleService,
    SessionService,
    MfaService,
    WalletService,
    IdentityWorkflowTrigger,
    PrismaClient,
    EmailPasswordProvider,
    WalletProvider,
    PasskeyProvider,
    { provide: 'IIdentityRepository', useClass: PrismaIdentityRepository },
    { provide: 'IOrganizationRepository', useClass: PrismaOrganizationRepository },
    { provide: 'IRoleRepository', useClass: PrismaRoleRepository },
    { provide: 'ISessionStore', useClass: PrismaSessionStore },
    { provide: 'IIdentityEventBus', useClass: IdentityEventBus },
    { provide: 'IAuthProviderRegistry', useClass: AuthProviderRegistry },
    { provide: 'IWorkflowTriggerService', useValue: null },
    IdentityEventBus,
    AuthProviderRegistry,
  ],
  exports: [
    IdentityService, OrganizationService, RoleService, SessionService, MfaService, WalletService,
    'IIdentityEventBus', 'IAuthProviderRegistry',
  ],
})
export class IdentityEngineModule implements OnModuleInit {
  constructor(
    private readonly registry: AuthProviderRegistry,
    private readonly emailPassword: EmailPasswordProvider,
    private readonly wallet: WalletProvider,
    private readonly passkey: PasskeyProvider,
  ) {}

  onModuleInit() {
    this.registry.register(this.emailPassword);
    this.registry.register(this.wallet);
    this.registry.register(this.passkey);
    const oauthProviders: IdentityProvider[] = ['google', 'github', 'apple', 'microsoft', 'discord', 'x'];
    for (const provider of oauthProviders) {
      this.registry.register(new OAuthProvider(provider));
    }
  }
}