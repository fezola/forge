import { Module, OnModuleInit } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';
import { ConnectorRuntimeModule } from '@forge/connector-runtime';
import { SecretManagerModule } from '@forge/secret-manager';
import { WorkflowService } from '../application/workflow.service';
import { WorkflowExecutionService } from '../application/workflow-execution.service';
import { WorkflowRuntimeService } from '../application/workflow-runtime.service';
import { NodeRegistryService } from '../application/node-registry.service';
import { VariableResolverService } from '../application/variable-resolver.service';
import { PrismaWorkflowRepository } from '../infrastructure/prisma-workflow.repository';
import { NodeExecutorFactory } from '../infrastructure/node-executor.factory';
import { ConditionNodeExecutor } from '../infrastructure/node-executors/condition-node-executor';
import { LoopNodeExecutor } from '../infrastructure/node-executors/loop-node-executor';
import { DelayNodeExecutor } from '../infrastructure/node-executors/delay-node-executor';
import { SwitchNodeExecutor } from '../infrastructure/node-executors/switch-node-executor';
import { VariableNodeExecutor } from '../infrastructure/node-executors/variable-node-executor';
import { ActionNodeExecutor } from '../infrastructure/node-executors/action-node-executor';
import { RetryHandler } from '../infrastructure/retry-handler';
import { WorkflowController } from './workflow.controller';
import { WorkflowExecutionController } from './workflow-execution.controller';
import { WorkflowGateway } from './workflow.gateway';

@Module({
  imports: [
    HttpModule,
    ConnectorRuntimeModule,
    SecretManagerModule,
  ],
  providers: [
    WorkflowService,
    WorkflowExecutionService,
    WorkflowRuntimeService,
    NodeRegistryService,
    VariableResolverService,
    RetryHandler,
    PrismaClient,
    { provide: 'IWorkflowRepository', useClass: PrismaWorkflowRepository },
    { provide: 'INodeExecutor', useClass: NodeExecutorFactory },
    ConditionNodeExecutor,
    LoopNodeExecutor,
    DelayNodeExecutor,
    SwitchNodeExecutor,
    VariableNodeExecutor,
    ActionNodeExecutor,
  ],
  controllers: [WorkflowController, WorkflowExecutionController],
  exports: [WorkflowService, WorkflowExecutionService, WorkflowRuntimeService, NodeRegistryService],
})
export class WorkflowEngineModule implements OnModuleInit {
  constructor(
    private readonly factory: NodeExecutorFactory,
    private readonly condition: ConditionNodeExecutor,
    private readonly loop: LoopNodeExecutor,
    private readonly delay: DelayNodeExecutor,
    private readonly switchExec: SwitchNodeExecutor,
    private readonly variable: VariableNodeExecutor,
    private readonly action: ActionNodeExecutor,
  ) {}

  onModuleInit() {
    this.factory.register('condition', this.condition);
    this.factory.register('loop', this.loop);
    this.factory.register('delay', this.delay);
    this.factory.register('switch', this.switchExec);
    this.factory.register('variable', this.variable);
    this.factory.register('action', this.action);
    // api_call, database, email, webhook nodes use a generic passthrough or fallback
  }
}
