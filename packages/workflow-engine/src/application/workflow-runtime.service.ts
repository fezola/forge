import { Injectable, Inject } from '@nestjs/common';
import { IWorkflowRepository } from '../domain/workflow.repository.interface';
import { INodeExecutor } from '../domain/node-executor.interface';
import { VariableResolverService } from './variable-resolver.service';
import { NodeRegistryService } from './node-registry.service';
import { WorkflowEntity } from '../domain/workflow.entity';
import { NodeDefinition, EdgeDefinition, WorkflowRunResult, WorkflowExecution, NodeExecutionResult, ExecutionLogEntry } from '@forge/workflow-types';
import { IWorkflowExecutor } from '../domain/workflow-executor.interface';

@Injectable()
export class WorkflowRuntimeService implements IWorkflowExecutor {
  private executions: Map<string, { status: string; cancel: boolean }> = new Map();
  private log: ExecutionLogEntry[] = [];

  constructor(
    @Inject('IWorkflowRepository')
    private readonly repo: IWorkflowRepository,
    @Inject('INodeExecutor')
    private readonly nodeExecutor: INodeExecutor,
    private readonly variableResolver: VariableResolverService,
    private readonly nodeRegistry: NodeRegistryService,
  ) {}

  async execute(
    workflow: WorkflowEntity,
    input: Record<string, unknown>,
    triggeredBy: string,
  ): Promise<WorkflowRunResult> {
    const executionId = crypto.randomUUID();
    this.executions.set(executionId, { status: 'running', cancel: false });

    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      projectId: workflow.projectId,
      version: workflow.version,
      status: 'running',
      triggeredBy,
      input,
      startedAt: new Date().toISOString(),
    };

    const nodeResults: NodeExecutionResult[] = [];
    const context: Record<string, unknown> = { ...input };

    try {
      const startNodes = this.getStartNodes(workflow.graph.edges, workflow.graph.nodes);
      await this.executeNodes(
        workflow.graph.nodes,
        workflow.graph.edges,
        startNodes,
        context,
        nodeResults,
        executionId,
        workflow.projectId,
      );

      execution.status = 'completed';
      execution.output = context;
      execution.completedAt = new Date().toISOString();
      execution.duration = new Date(execution.startedAt).getTime() - new Date(execution.startedAt).getTime();

    } catch (error: any) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.completedAt = new Date().toISOString();
    }

    this.executions.set(executionId, { status: execution.status, cancel: false });

    return {
      execution,
      nodeResults,
    };
  }

  async validate(workflow: WorkflowEntity): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const graph = workflow.graph;

    if (!graph.nodes || graph.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    const triggerNodes = graph.nodes.filter(n => n.type === 'trigger');
    if (triggerNodes.length === 0) {
      errors.push('Workflow must have a trigger node');
    }
    if (triggerNodes.length > 1) {
      errors.push('Workflow can only have one trigger node');
    }

    if (graph.edges) {
      for (const node of graph.nodes) {
        const outgoing = graph.edges.filter(e => e.sourceNodeId === node.id);
        if (node.type === 'end' && outgoing.length > 0) {
          errors.push(`End node "${node.label}" cannot have outgoing edges`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async cancel(executionId: string): Promise<void> {
    const exec = this.executions.get(executionId);
    if (exec) {
      exec.cancel = true;
      this.executions.set(executionId, { ...exec, status: 'cancelled' });
    }
  }

  private async executeNodes(
    nodes: NodeDefinition[],
    edges: EdgeDefinition[],
    currentIds: string[],
    context: Record<string, unknown>,
    results: NodeExecutionResult[],
    executionId: string,
    projectId: string,
  ): Promise<void> {
    for (const nodeId of currentIds) {
      if (this.executions.get(executionId)?.cancel) return;

      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      if (node.type === 'end') return;

      const startTime = new Date().toISOString();
      const result: NodeExecutionResult = {
        nodeId: node.id,
        nodeType: node.type,
        status: 'running',
        input: node.config,
        startedAt: startTime,
        attempts: 1,
      };

      try {
        const resolvedInput = await this.variableResolver.resolve(node.config as Record<string, unknown>, context, projectId);
        result.input = resolvedInput;

        const nodeResult = await this.nodeExecutors(node, { variables: context, input: resolvedInput, secrets: {} });
        Object.assign(result, nodeResult);
        result.status = 'completed';

        if (nodeResult.output) {
          context[`step_${node.id}`] = nodeResult.output;
        }

        const nextNodes = this.getNextNodes(nodeId, edges, result);
        await this.executeNodes(nodes, edges, nextNodes, context, results, executionId, projectId);

      } catch (error: any) {
        result.status = 'failed';
        result.error = error.message;
      }

      result.completedAt = new Date().toISOString();
      result.duration = new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime();
      results.push(result);
    }
  }

  private getStartNodes(edges: EdgeDefinition[], nodes: NodeDefinition[]): string[] {
    const hasIncoming = new Set(edges.map(e => e.targetNodeId));
    return nodes.filter(n => !hasIncoming.has(n.id) && n.type !== 'end').map(n => n.id);
  }

  private getNextNodes(nodeId: string, edges: EdgeDefinition[], lastResult: NodeExecutionResult): string[] {
    const outgoing = edges.filter(e => e.sourceNodeId === nodeId);

    if (lastResult.nodeType === 'condition') {
      const branch = lastResult.output === true ? 'true' : 'false';
      const conditionEdge = outgoing.find(e => e.sourcePortId === branch);
      return conditionEdge ? [conditionEdge.targetNodeId] : [];
    }

    if (lastResult.nodeType === 'switch') {
      // Switch uses the matched case port
      return outgoing.map(e => e.targetNodeId);
    }

    if (lastResult.nodeType === 'parallel') {
      return outgoing.map(e => e.targetNodeId);
    }

    const primary = outgoing.find(e => e.sourcePortId === 'out' || !e.sourcePortId);
    return primary ? [primary.targetNodeId] : outgoing.length > 0 ? [outgoing[0].targetNodeId] : [];
  }
}
