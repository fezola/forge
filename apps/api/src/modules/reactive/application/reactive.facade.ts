import { Injectable } from '@nestjs/common';
import { BindingService, ExpressionEvaluatorService, LiveQueryService, SourceResolverService } from '@forge/reactive-engine';

@Injectable()
export class ReactiveFacade {
  constructor(
    private readonly bindingService: BindingService,
    private readonly expressionService: ExpressionEvaluatorService,
    private readonly queryService: LiveQueryService,
    private readonly sourceResolver: SourceResolverService,
  ) {}

  // --- Bindings ---
  async createBinding(input: any) {
    return this.bindingService.create(input);
  }

  async listBindings(projectId: string) {
    return this.bindingService.list(projectId);
  }

  async getBinding(id: string) {
    return this.bindingService.get(id);
  }

  async updateBinding(id: string, input: any) {
    return this.bindingService.update(id, input);
  }

  async deleteBinding(id: string) {
    return this.bindingService.delete(id);
  }

  async resolveBindings(input: any) {
    return this.bindingService.resolveAll(input);
  }

  async resolveBinding(id: string, context?: Record<string, unknown>) {
    return this.bindingService.resolve(id, context);
  }

  // --- Expressions ---
  async evaluateExpression(expression: string, context: Record<string, unknown>) {
    return this.expressionService.evaluate(expression, context);
  }

  async parseExpression(expression: string) {
    return this.expressionService.parse(expression);
  }

  // --- Queries ---
  async executeQuery(input: any) {
    return this.queryService.execute(input);
  }

  // --- Sources ---
  async listSources(projectId: string) {
    return [];
  }
}
