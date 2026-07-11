import { Injectable, Inject } from '@nestjs/common';
import type { IUsageRepository } from '../domain/repository-interfaces';
import type { UsageRecord } from '@forge/payment-types';

@Injectable()
export class UsageService {
  constructor(@Inject('IUsageRepository') private readonly usageRepo: IUsageRepository) {}

  async record(data: { subscriptionId: string; metric: string; quantity?: number; metadata?: Record<string, unknown> }): Promise<UsageRecord> {
    return this.usageRepo.record(data);
  }

  async getUsage(subscriptionId: string, metric: string, from: Date, to: Date): Promise<number> {
    return this.usageRepo.getUsage(subscriptionId, metric, from, to);
  }

  async getSummary(subscriptionId: string, from: Date, to: Date): Promise<{ metric: string; total: number }[]> {
    return this.usageRepo.getSummary(subscriptionId, from, to);
  }

  async getBySubscription(subscriptionId: string): Promise<UsageRecord[]> {
    return this.usageRepo.getBySubscription(subscriptionId);
  }
}
