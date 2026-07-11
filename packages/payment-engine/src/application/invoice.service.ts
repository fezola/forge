import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IInvoiceRepository } from '../domain/repository-interfaces';
import type { Invoice } from '@forge/payment-types';

@Injectable()
export class InvoiceService {
  constructor(@Inject('IInvoiceRepository') private readonly invoiceRepo: IInvoiceRepository) {}

  async findById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findById(id);
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async findBySubscription(subscriptionId: string): Promise<Invoice[]> {
    return this.invoiceRepo.findBySubscription(subscriptionId);
  }

  async findByProject(projectId: string): Promise<Invoice[]> {
    return this.invoiceRepo.findByProject(projectId);
  }

  async payInvoice(id: string, paidAmount: number): Promise<Invoice> {
    await this.findById(id);
    return this.invoiceRepo.markPaid(id, paidAmount);
  }

  async getAll(): Promise<Invoice[]> {
    return this.invoiceRepo.findByStatus('open');
  }
}
