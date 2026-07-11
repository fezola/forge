import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import type { ISubscriptionRepository, IPlanRepository } from '../domain/repository-interfaces';
import type { IPaymentProvider } from '../domain/payment-provider.interface';
import type { Subscription, CreateSubscriptionRequest, UpdateSubscriptionRequest } from '@forge/payment-types';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @Inject('ISubscriptionRepository') private readonly subRepo: ISubscriptionRepository,
    @Inject('IPlanRepository') private readonly planRepo: IPlanRepository,
    @Inject('IPaymentProvider') private readonly paymentProvider: IPaymentProvider,
  ) {}

  async findByProject(projectId: string): Promise<Subscription[]> {
    return this.subRepo.findByProject(projectId);
  }

  async findActiveByProject(projectId: string): Promise<Subscription | null> {
    return this.subRepo.findActiveByProject(projectId);
  }

  async findById(id: string): Promise<Subscription> {
    const sub = await this.subRepo.findById(id);
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async createSubscription(input: CreateSubscriptionRequest & { returnUrl: string }): Promise<{ subscription: Subscription; checkoutUrl?: string }> {
    const plan = await this.planRepo.findById(input.planId);
    if (!plan) throw new NotFoundException('Plan not found');

    const existing = await this.subRepo.findActiveByProject(input.projectId);
    if (existing) throw new BadRequestException('Project already has an active subscription');

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    const trialEndsAt = input.trialDays ? new Date(Date.now() + input.trialDays * 86400000) : undefined;

    const subscription = await this.subRepo.create({
      projectId: input.projectId,
      planId: input.planId,
      currentPeriodEnd: periodEnd,
      trialEndsAt,
      metadata: input.metadata,
    });

    try {
      const checkout = await this.paymentProvider.createCheckoutSession({
        planId: input.planId,
        projectId: input.projectId,
        returnUrl: input.returnUrl,
        trialDays: input.trialDays,
      });
      await this.subRepo.update(subscription.id, { providerSubscriptionId: checkout.sessionId });
      return { subscription, checkoutUrl: checkout.url };
    } catch (err) {
      this.logger.error(`Failed to create checkout session: ${(err as Error).message}`);
      return { subscription };
    }
  }

  async updateSubscription(id: string, input: UpdateSubscriptionRequest): Promise<Subscription> {
    const sub = await this.findById(id);
    if (input.planId && input.planId !== sub.planId) {
      const plan = await this.planRepo.findById(input.planId);
      if (!plan) throw new NotFoundException('Plan not found');
    }
    await this.subRepo.update(id, input as any);
    return this.findById(id);
  }

  async cancelSubscription(id: string, cancelAtPeriodEnd = true): Promise<void> {
    const sub = await this.findById(id);
    await this.subRepo.cancel(id, cancelAtPeriodEnd);
    if (sub.providerSubscriptionId) {
      try {
        await this.paymentProvider.cancelSubscription(sub.providerSubscriptionId);
      } catch (err) {
        this.logger.error(`Failed to cancel provider subscription: ${(err as Error).message}`);
      }
    }
  }

  async processExpiredTrials(): Promise<number> {
    const expired = await this.subRepo.findExpiringTrials(new Date());
    for (const sub of expired) {
      await this.subRepo.cancel(sub.id, false);
    }
    return expired.length;
  }
}
