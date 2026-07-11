import { Injectable, Inject } from '@nestjs/common';
import type { IModelRepository } from '../domain/repository-interfaces';
import type { AiModel } from '@forge/ai-types';

@Injectable()
export class ModelService {
  constructor(@Inject('IModelRepository') private readonly modelRepo: IModelRepository) {}

  async findAll(provider?: string, enabledOnly?: boolean): Promise<AiModel[]> {
    return this.modelRepo.findAll(provider, enabledOnly);
  }

  async findById(id: string): Promise<AiModel> {
    const model = await this.modelRepo.findById(id);
    if (!model) throw new Error('Model not found');
    return model;
  }
}
