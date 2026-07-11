import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ICompletionRepository, IPromptRepository } from '../domain/repository-interfaces';
import type { IAiProvider } from '../domain/ai-provider.interface';
import type { AiCompletion, ChatCompletionRequest, ExecutePromptRequest } from '@forge/ai-types';

@Injectable()
export class CompletionService {
  private readonly logger = new Logger(CompletionService.name);

  constructor(
    @Inject('ICompletionRepository') private readonly completionRepo: ICompletionRepository,
    @Inject('IPromptRepository') private readonly promptRepo: IPromptRepository,
    @Inject('IAiProvider') private readonly aiProvider: IAiProvider,
  ) {}

  async findByProject(projectId: string): Promise<AiCompletion[]> {
    return this.completionRepo.findByProject(projectId);
  }

  async chat(input: ChatCompletionRequest & { projectId: string; promptId?: string }): Promise<AiCompletion> {
    const start = Date.now();
    try {
      const response = await this.aiProvider.chat({
        model: input.model,
        messages: input.messages,
        temperature: input.temperature,
        maxTokens: input.maxTokens,
        topP: input.topP,
      });
      const latencyMs = Date.now() - start;
      return this.completionRepo.create({
        promptId: input.promptId,
        projectId: input.projectId,
        modelId: input.model,
        provider: this.aiProvider.provider,
        prompt: JSON.stringify(input.messages),
        response: response.content,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        totalTokens: response.inputTokens + response.outputTokens,
        latencyMs,
        finishReason: response.finishReason,
        temperature: input.temperature,
        maxTokens: input.maxTokens,
      });
    } catch (err) {
      this.logger.error(`Chat completion failed: ${(err as Error).message}`);
      throw err;
    }
  }

  async executePrompt(input: ExecutePromptRequest & { projectId: string }): Promise<AiCompletion> {
    const prompt = await this.promptRepo.findById(input.promptId);
    if (!prompt) throw new Error('Prompt not found');

    let userMessage = prompt.userTemplate || '';
    if (input.variables) {
      for (const [key, value] of Object.entries(input.variables)) {
        userMessage = userMessage.replace(`{{${key}}}`, value);
      }
    }

    const messages = [];
    if (prompt.systemPrompt) messages.push({ role: 'system' as const, content: prompt.systemPrompt });
    messages.push({ role: 'user' as const, content: userMessage });

    return this.chat({
      projectId: input.projectId,
      promptId: prompt.id,
      model: input.modelId || prompt.modelId || 'gpt-4',
      messages,
      temperature: input.temperature ?? prompt.temperature ?? undefined,
      maxTokens: input.maxTokens ?? prompt.maxTokens ?? undefined,
    });
  }
}
