import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPlanRepository } from '../domain/repository-interfaces';
import type { Plan, PlanFeature } from '@forge/payment-types';

@Injectable()
export class PlanService {
  constructor(@Inject('IPlanRepository') private readonly planRepo: IPlanRepository) {}

  async findAll(activeOnly?: boolean): Promise<Plan[]> {
    return this.planRepo.findAll(activeOnly);
  }

  async findPublic(): Promise<Plan[]> {
    return this.planRepo.findPublic();
  }

  async findById(id: string): Promise<Plan> {
    const plan = await this.planRepo.findById(id);
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async findBySlug(slug: string): Promise<Plan> {
    const plan = await this.planRepo.findBySlug(slug);
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async create(data: Parameters<IPlanRepository['create']>[0]): Promise<Plan> {
    return this.planRepo.create(data);
  }

  async update(id: string, data: Partial<Plan>): Promise<Plan> {
    await this.findById(id);
    return this.planRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.planRepo.delete(id);
  }
}
