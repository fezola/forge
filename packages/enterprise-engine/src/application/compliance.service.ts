import { Injectable, Inject } from '@nestjs/common';
import type { IComplianceRepository } from '../domain/repository-interfaces';
import type { ComplianceReport } from '@forge/enterprise-types';

@Injectable()
export class ComplianceService {
  constructor(@Inject('IComplianceRepository') private readonly repo: IComplianceRepository) {}

  async findByProject(projectId: string): Promise<ComplianceReport[]> {
    return this.repo.findByProject(projectId);
  }

  async findById(id: string): Promise<ComplianceReport> {
    const report = await this.repo.findById(id);
    if (!report) throw new Error('Compliance report not found');
    return report;
  }

  async create(data: { projectId?: string; organizationId?: string; type: string; title: string; description?: string; periodStart: string; periodEnd: string; generatedBy: string; findings?: Record<string, unknown>; evidence?: Record<string, unknown> }): Promise<ComplianceReport> {
    return this.repo.create(data);
  }

  async update(id: string, data: Partial<ComplianceReport>): Promise<ComplianceReport> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
