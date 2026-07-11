import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConnectorRegistryModule } from '@forge/connector-registry';
import { SecretManagerModule } from '@forge/secret-manager';
import { ConnectorRuntimeService } from '../application/connector-runtime.service';
import { ActionOrchestratorService } from '../application/action-orchestrator.service';
import { WorkflowExecutorService } from '../application/workflow-executor.service';
import { SandboxedExecutor } from '../infrastructure/sandboxed-executor';
import { TriggerPollerService } from '../infrastructure/trigger-poller.service';
import { WebhookReceiverService } from '../infrastructure/webhook-receiver.service';
import { ConnectorRuntimeController } from './connector-runtime.controller';
import { ConnectorRuntimeGateway } from './connector-runtime.gateway';

@Module({
  imports: [
    HttpModule.register({ timeout: 30000 }),
    ConnectorRegistryModule,
    SecretManagerModule,
  ],
  providers: [
    ConnectorRuntimeService,
    ActionOrchestratorService,
    WorkflowExecutorService,
    TriggerPollerService,
    WebhookReceiverService,
    { provide: 'IActionExecutor', useClass: SandboxedExecutor },
  ],
  controllers: [ConnectorRuntimeController],
  exports: [ConnectorRuntimeService, ActionOrchestratorService, WorkflowExecutorService],
})
export class ConnectorRuntimeModule {}
