import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPaymentRepository, IInvoiceRepository } from '../domain/repository-interfaces';
import type { IPaymentProvider } from '../domain/payment-provider.interface';
import type { Payment, InitiatePaymentRequest } from '@forge/payment-types';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('IPaymentRepository') private readonly paymentRepo: IPaymentRepository,
    @Inject('IInvoiceRepository') private readonly invoiceRepo: IInvoiceRepository,
    @Inject('IPaymentProvider') private readonly paymentProvider: IPaymentProvider,
  ) {}

  async findByInvoice(invoiceId: string): Promise<Payment[]> {
    return this.paymentRepo.findByInvoice(invoiceId);
  }

  async initiatePayment(input: InitiatePaymentRequest & { amount: number; currency?: string }): Promise<{ clientSecret: string; paymentId: string }> {
    const invoice = await this.invoiceRepo.findById(input.invoiceId);
    if (!invoice) throw new NotFoundException('Invoice not found');

    const intent = await this.paymentProvider.createPaymentIntent({
      amount: input.amount,
      currency: input.currency || 'usd',
      metadata: { invoiceId: input.invoiceId },
    });

    const payment = await this.paymentRepo.create({
      invoiceId: input.invoiceId,
      amount: input.amount,
      currency: input.currency || 'usd',
      providerPaymentId: intent.intentId,
      provider: input.provider,
    });

    return { clientSecret: intent.clientSecret, paymentId: payment.id };
  }

  async handleWebhook(provider: string, payload: unknown, signature: string): Promise<void> {
    const event = await this.paymentProvider.handleWebhook(payload, signature);
    if (event.event === 'payment_intent.succeeded') {
      const data = event.data as any;
      await this.paymentRepo.update(data.id, { status: 'succeeded' });
    }
  }
}
