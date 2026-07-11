import { Module, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConnectorRuntimeModule } from '@forge/connector-runtime';
import { SecretManagerModule } from '@forge/secret-manager';
import { BindingService } from '../application/binding.service';
import { SourceResolverService } from '../application/source-resolver.service';
import { ExpressionEvaluatorService } from '../application/expression-evaluator.service';
import { LiveQueryService } from '../application/live-query.service';
import { SubscriptionManagerService } from '../application/subscription-manager.service';
import { ReactiveStateService } from '../application/reactive-state.service';
import { PrismaBindingRepository } from '../infrastructure/prisma-binding.repository';
import { ConnectorSourceResolver } from '../infrastructure/connector-source.resolver';
import { UserSourceResolver } from '../infrastructure/user-source.resolver';
import { DefaultLiveQueryExecutor } from '../infrastructure/default-live-query-executor';
import { BindingController } from './binding.controller';
import { ReactiveGateway } from './reactive.gateway';
import { QueryController } from './query.controller';
import { ExpressionController } from './expression.controller';

@Module({
  imports: [ConnectorRuntimeModule, SecretManagerModule],
  providers: [
    BindingService,
    SourceResolverService,
    ExpressionEvaluatorService,
    LiveQueryService,
    SubscriptionManagerService,
    ReactiveStateService,
    PrismaClient,
    { provide: 'IBindingRepository', useClass: PrismaBindingRepository },
    { provide: 'ILiveQueryExecutor', useClass: DefaultLiveQueryExecutor },
    ConnectorSourceResolver,
    UserSourceResolver,
  ],
  controllers: [BindingController, QueryController, ExpressionController],
  exports: [BindingService, SourceResolverService, ExpressionEvaluatorService, LiveQueryService, SubscriptionManagerService, ReactiveStateService],
})
export class ReactiveEngineModule implements OnModuleInit {
  constructor(
    private readonly sourceResolver: SourceResolverService,
    private readonly connectorSource: ConnectorSourceResolver,
    private readonly userSource: UserSourceResolver,
  ) {}

  onModuleInit() {
    this.sourceResolver.register('connector.action', this.connectorSource);
    this.sourceResolver.register('user.current', this.userSource);
    this.sourceResolver.register('user.profile', this.userSource);
    this.sourceResolver.register('user.session', this.userSource);
  }
}
