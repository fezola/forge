import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/presentation/auth.module';
import { ProjectModule } from './modules/project/presentation/project.module';
import { UserModule } from './modules/user/presentation/user.module';
import { ConnectorModule } from './modules/connector/presentation/connector.module';
import { WorkflowModule } from './modules/workflow/presentation/workflow.module';
import { ReactiveModule } from './modules/reactive/presentation/reactive.module';
import { IdentityModule } from './modules/identity/presentation/identity.module';
import { StorageModule } from './modules/storage/presentation/storage.module';
import { ForgeConfigModule } from './modules/config/presentation/config.module';
import { CmsModule } from './modules/cms/presentation/cms.module';
import { PaymentModule } from './modules/payment/presentation/payment.module';
import { BlockchainModule } from './modules/blockchain/presentation/blockchain.module';
import { AiModule } from './modules/ai/presentation/ai.module';
import { ComponentModule } from './modules/component/presentation/component.module';
import { MarketplaceModule } from './modules/marketplace/presentation/marketplace.module';
import { DeploymentModule } from './modules/deployment/presentation/deployment.module';
import { EnterpriseModule } from './modules/enterprise/presentation/enterprise.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
    ]),
    AuthModule,
    ProjectModule,
    UserModule,
    ConnectorModule,
    WorkflowModule,
    ReactiveModule,
    IdentityModule,
    StorageModule,
    ForgeConfigModule,
    CmsModule,
    PaymentModule,
    BlockchainModule,
    AiModule,
    ComponentModule,
    MarketplaceModule,
    DeploymentModule,
    EnterpriseModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
