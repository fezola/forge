export interface Invoice {
  id: string;
  subscriptionId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  description?: string | null;
  dueDate?: string | null;
  paidAt?: string | null;
  paidAmount?: number | null;
  providerInvoiceId?: string | null;
  pdfUrl?: string | null;
  lineItems: InvoiceLineItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  type: string;
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'uncollectible' | 'void' | 'overdue';
