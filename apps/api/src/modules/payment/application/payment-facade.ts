import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PaymentFacade {
  constructor(private readonly prisma: PrismaClient) {}

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      include: { features: true },
    });
  }

  async getPublicPlans() {
    return this.prisma.plan.findMany({
      where: { active: true, public: true },
      orderBy: { sortOrder: 'asc' },
      include: { features: true },
    });
  }

  async getPlan(id: string) {
    return this.prisma.plan.findUnique({ where: { id }, include: { features: true } });
  }

  async createPlan(data: {
    name: string; slug: string; description?: string; price: number;
    currency?: string; interval?: string; trialDays?: number;
    maxProjects?: number; maxStorageGb?: number; maxIdentities?: number;
    maxBandwidthGb?: number; maxApiRequests?: number;
  }) {
    return this.prisma.plan.create({
      data: { ...data, currency: data.currency || 'usd', interval: data.interval || 'month' },
      include: { features: true },
    });
  }

  async updatePlan(id: string, data: any) {
    return this.prisma.plan.update({ where: { id }, data, include: { features: true } });
  }

  async deletePlan(id: string) {
    await this.prisma.plan.delete({ where: { id } });
  }

  async addFeature(planId: string, feature: { key: string; name: string; value: string; highlight?: boolean }) {
    return this.prisma.planFeature.create({ data: { ...feature, planId, highlight: feature.highlight ?? false } });
  }

  async removeFeature(featureId: string) {
    await this.prisma.planFeature.delete({ where: { id: featureId } });
  }

  async getSubscriptions(projectId?: string) {
    return this.prisma.subscription.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { createdAt: 'desc' },
      include: { plan: { include: { features: true } } },
    });
  }

  async getSubscription(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: { plan: { include: { features: true } }, invoices: { orderBy: { createdAt: 'desc' }, take: 10 }, usage: true },
    });
  }

  async getInvoices(projectId?: string) {
    const where: any = {};
    if (projectId) {
      where.subscription = { projectId };
    }
    return this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { lineItems: true, payments: true, subscription: { select: { projectId: true } } },
    });
  }

  async getInvoice(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: { lineItems: true, payments: true },
    });
  }
}
