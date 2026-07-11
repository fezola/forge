import type {
  PaymentsState,
  PaymentTransaction,
  PaymentCustomer,
  PaymentSubscription,
  PaymentInvoice,
  PaymentInvoiceItem,
  PaymentCoupon,
  PaymentLink,
  PaymentProvider,
  WalletConnection,
  PaymentWebhook,
  PaymentRefund,
  SubscriptionStatus,
  BillingInterval,
} from "../types/payments";
import { PaymentProcessor, type CreatePaymentInput, type IssueRefundInput, computePaymentsKPI } from "../lib/paymentProcessor";
import { checkoutEngine, type CheckoutSession } from "../lib/checkoutEngine";
import { subscriptionEngine, type CreateSubscriptionInput } from "../lib/subscriptionEngine";
import { webhookDeliverer } from "../lib/webhookDeliverer";
import { eventBus } from "../lib/eventBus";
import { providerFactory } from "../lib/providerFactory";
import type { ProviderAdapter, ProviderCredentials } from "../types/providers";

export interface TransactionFilters {
  search?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface SubFilters {
  status?: SubscriptionStatus;
  search?: string;
}

export interface InvoiceFilters {
  status?: string;
  search?: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  type: "one-time" | "recurring";
  price: number;
  currency: string;
}

export interface CreateCouponInput {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  maxRedemptions: number;
  minOrderAmount: number;
  duration: "forever" | "once" | "limited";
  durationMonths: number;
  activeFrom?: string;
  activeUntil?: string;
}

export interface CreatePaymentLinkInput {
  name: string;
  productId: string;
  productName: string;
  allowQuantity: boolean;
  checkoutStyle: "minimal" | "branded" | "full-page";
}

export interface ConnectProviderInput {
  name: string;
  type: "stripe" | "paystack" | "flutterwave" | "bridge" | "circle" | "coinbase" | "monnify" | "solana-pay";
  environment: "live" | "test";
  apiKey: string;
}

export interface AddWalletInput {
  network: string;
  address: string;
  label: string;
}

export interface CreateWebhookInput {
  url: string;
  description: string;
  events: string[];
}

export interface IssueRefundAPIInput {
  transactionId: string;
  amount: number;
  reason: string;
  notes?: string;
}

export interface CreateCheckoutSessionInput {
  productId: string;
  productName: string;
  productPrice: number;
  currency?: string;
  quantity?: number;
  customerEmail?: string;
  customerName?: string;
  couponCode?: string;
}

let counter = 0;

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${String(++counter).padStart(4, "0")}`;
}

export class PaymentsAPI {
  private processor: PaymentProcessor;
  private store: { getState: () => PaymentsState; setState: (patch: Partial<PaymentsState>) => void };

  constructor(
    store: { getState: () => PaymentsState; setState: (patch: Partial<PaymentsState>) => void },
    processor?: PaymentProcessor
  ) {
    this.store = store;
    const adapter = providerFactory.get("mock") || providerFactory.getAll()[0];
    this.processor = processor || new PaymentProcessor(adapter);
    subscriptionEngine.setProcessor(this.processor);
  }

  getProcessor(): PaymentProcessor {
    return this.processor;
  }

  getState(): PaymentsState {
    return this.store.getState();
  }

  // ── Transactions ──

  getTransactions(filters?: TransactionFilters): PaymentTransaction[] {
    let txns = this.store.getState().transactions;

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        txns = txns.filter(
          (t) =>
            t.id.toLowerCase().includes(q) ||
            t.customerEmail.toLowerCase().includes(q) ||
            t.customerName.toLowerCase().includes(q) ||
            t.productName.toLowerCase().includes(q)
        );
      }
      if (filters.status) {
        txns = txns.filter((t) => t.status === filters.status);
      }
      if (filters.minAmount !== undefined) {
        txns = txns.filter((t) => t.amount >= filters.minAmount!);
      }
      if (filters.maxAmount !== undefined) {
        txns = txns.filter((t) => t.amount <= filters.maxAmount!);
      }
    }

    return txns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getTransaction(id: string): PaymentTransaction | undefined {
    return this.store.getState().transactions.find((t) => t.id === id);
  }

  // ── Customers ──

  getCustomers(search?: string): PaymentCustomer[] {
    let customers = this.store.getState().customers;
    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }
    return customers;
  }

  getCustomer(id: string): PaymentCustomer | undefined {
    return this.store.getState().customers.find((c) => c.id === id);
  }

  createCustomer(data: { name: string; email: string; phone?: string }): PaymentCustomer {
    const customer: PaymentCustomer = {
      id: genId("cus"),
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      avatar: "",
      totalSpent: 0,
      totalTransactions: 0,
      currency: "usd",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
    };

    this.store.setState({ customers: [customer, ...this.store.getState().customers] });
    eventBus.emit("customer.created", customer);
    return customer;
  }

  // ── Products ──

  getProducts(): { id: string; name: string; description: string; type: string; price: number; currency: string; active: boolean; createdAt: string }[] {
    const txns = this.store.getState().transactions;
    const names = [...new Set(txns.filter((t) => t.productId).map((t) => t.productName))];
    return names.map((name, i) => ({
      id: `prod_${String(i + 1).padStart(3, "0")}`,
      name,
      description: `${name} product`,
      type: "one-time",
      price: txns.find((t) => t.productName === name)?.amount || 0,
      currency: "usd",
      active: true,
      createdAt: new Date().toISOString(),
    }));
  }

  createProduct(input: CreateProductInput) {
    const product = { id: genId("prod"), ...input, createdAt: new Date().toISOString() };
    eventBus.emit("product.created", product);
    return product;
  }

  // ── Subscriptions ──

  getSubscriptions(filters?: SubFilters): PaymentSubscription[] {
    let subs = this.store.getState().subscriptions;
    if (filters?.status) subs = subs.filter((s) => s.status === filters.status);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      subs = subs.filter((s) => s.customerEmail.toLowerCase().includes(q) || s.productName.toLowerCase().includes(q));
    }
    return subs;
  }

  createSubscription(data: CreateSubscriptionInput): PaymentSubscription {
    const { subscription } = subscriptionEngine.createSubscription(data);
    this.store.setState({ subscriptions: [subscription, ...this.store.getState().subscriptions] });
    return subscription;
  }

  cancelSubscription(id: string): PaymentSubscription {
    const sub = this.store.getState().subscriptions.find((s) => s.id === id);
    if (!sub) throw new Error("Subscription not found");
    const updated = subscriptionEngine.cancelSubscription(sub);
    this.store.setState({
      subscriptions: this.store.getState().subscriptions.map((s) => (s.id === id ? updated : s)),
    });
    return updated;
  }

  reactivateSubscription(id: string): PaymentSubscription {
    const sub = this.store.getState().subscriptions.find((s) => s.id === id);
    if (!sub) throw new Error("Subscription not found");
    const updated = subscriptionEngine.reactivateSubscription(sub);
    this.store.setState({
      subscriptions: this.store.getState().subscriptions.map((s) => (s.id === id ? updated : s)),
    });
    return updated;
  }

  // ── Invoices ──

  getInvoices(filters?: InvoiceFilters): PaymentInvoice[] {
    let invoices = this.store.getState().invoices;
    if (filters?.status) invoices = invoices.filter((inv) => inv.status === filters.status);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      invoices = invoices.filter(
        (inv) => inv.customerEmail.toLowerCase().includes(q) || inv.number.toLowerCase().includes(q)
      );
    }
    return invoices;
  }

  createInvoice(data: {
    customerId: string;
    amount: number;
    currency?: string;
    dueDate?: string;
    items?: PaymentInvoiceItem[];
  }): PaymentInvoice {
    const customers = this.store.getState().customers;
    const customer = customers.find((c) => c.id === data.customerId);
    const now = new Date();
    const due = data.dueDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const invoice: PaymentInvoice = {
      id: genId("inv"),
      number: `INV-${now.getFullYear()}-${String(now.getTime()).slice(-6)}`,
      customerId: data.customerId,
      customerEmail: customer?.email || "",
      customerName: customer?.name || "",
      subscriptionId: "",
      status: "open",
      amount: data.amount,
      amountPaid: 0,
      amountDue: data.amount,
      currency: data.currency || "usd",
      items: data.items || [],
      dueDate: due,
      paidAt: "",
      createdAt: now.toISOString(),
      pdfUrl: "",
      notes: "",
    };

    this.store.setState({ invoices: [invoice, ...this.store.getState().invoices] });
    eventBus.emit("invoice.created", invoice);
    return invoice;
  }

  markInvoicePaid(id: string): PaymentInvoice | undefined {
    const inv = this.store.getState().invoices.find((i) => i.id === id);
    if (!inv) return undefined;
    inv.status = "paid";
    inv.amountPaid = inv.amount;
    inv.amountDue = 0;
    inv.paidAt = new Date().toISOString();
    this.store.setState({
      invoices: this.store.getState().invoices.map((i) => (i.id === id ? inv : i)),
    });
    eventBus.emit("invoice.paid", inv);
    return { ...inv };
  }

  // ── Coupons ──

  getCoupons(): PaymentCoupon[] {
    return this.store.getState().coupons;
  }

  createCoupon(data: CreateCouponInput): PaymentCoupon {
    const coupon: PaymentCoupon = {
      id: genId("coup"),
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      appliesTo: "all",
      maxRedemptions: data.maxRedemptions,
      timesRedeemed: 0,
      minOrderAmount: data.minOrderAmount,
      duration: data.duration,
      durationMonths: data.durationMonths,
      activeFrom: data.activeFrom || new Date().toISOString(),
      activeUntil: data.activeUntil || "",
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.store.setState({ coupons: [coupon, ...this.store.getState().coupons] });
    eventBus.emit("coupon.created", coupon);
    return coupon;
  }

  deactivateCoupon(id: string): PaymentCoupon | undefined {
    const coupon = this.store.getState().coupons.find((c) => c.id === id);
    if (!coupon) return undefined;
    coupon.isActive = false;
    this.store.setState({
      coupons: this.store.getState().coupons.map((c) => (c.id === id ? coupon : c)),
    });
    return { ...coupon };
  }

  // ── Payment Links ──

  getPaymentLinks(): PaymentLink[] {
    return this.store.getState().paymentLinks;
  }

  createPaymentLink(data: CreatePaymentLinkInput): PaymentLink {
    const link: PaymentLink = {
      id: genId("pl"),
      name: data.name,
      url: `forge.pay/${data.name.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 6)}`,
      productId: data.productId,
      productName: data.productName,
      allowQuantity: data.allowQuantity,
      checkoutStyle: data.checkoutStyle,
      views: 0,
      checkouts: 0,
      revenue: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.store.setState({ paymentLinks: [link, ...this.store.getState().paymentLinks] });
    return link;
  }

  // ── Providers ──

  getProviders(): PaymentProvider[] {
    return this.store.getState().providers;
  }

  connectProvider(data: ConnectProviderInput): PaymentProvider {
    const provider: PaymentProvider = {
      id: genId("prov"),
      name: data.name,
      type: data.type,
      connected: true,
      environment: data.environment,
      accountName: `${data.name} Account`,
      createdAt: new Date().toISOString(),
    };

    providerFactory.createAndConnect(provider.id, data.type, {
      apiKey: data.apiKey,
      environment: data.environment,
    }).catch(() => {});

    this.store.setState({ providers: [...this.store.getState().providers, provider] });
    return provider;
  }

  disconnectProvider(id: string): void {
    this.store.setState({
      providers: this.store.getState().providers.map((p) =>
        p.id === id ? { ...p, connected: false } : p
      ),
    });
    providerFactory.remove(id);
  }

  // ── Wallets ──

  getWallets(): WalletConnection[] {
    return this.store.getState().wallets;
  }

  addWallet(data: AddWalletInput): WalletConnection {
    const wallet: WalletConnection = {
      id: genId("wal"),
      network: data.network,
      address: data.address,
      label: data.label,
      balance: 0,
      balanceUsd: 0,
      connectedAt: new Date().toISOString(),
      isActive: true,
    };

    this.store.setState({ wallets: [wallet, ...this.store.getState().wallets] });
    return wallet;
  }

  removeWallet(id: string): void {
    this.store.setState({
      wallets: this.store.getState().wallets.filter((w) => w.id !== id),
    });
  }

  // ── Webhooks ──

  getWebhooks(): PaymentWebhook[] {
    return this.store.getState().webhooks;
  }

  createWebhook(data: CreateWebhookInput): PaymentWebhook {
    const webhook: PaymentWebhook = {
      id: genId("wh"),
      url: data.url,
      description: data.description,
      secret: `whsec_${Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, "0")).join("")}`,
      events: data.events,
      isActive: true,
      lastDeliveryAt: "",
      lastDeliveryStatus: "success",
      createdAt: new Date().toISOString(),
    };

    this.store.setState({ webhooks: [webhook, ...this.store.getState().webhooks] });
    return webhook;
  }

  deleteWebhook(id: string): void {
    this.store.setState({
      webhooks: this.store.getState().webhooks.filter((w) => w.id !== id),
    });
  }

  regenerateSecret(id: string): PaymentWebhook | undefined {
    const webhook = this.store.getState().webhooks.find((w) => w.id === id);
    if (!webhook) return undefined;
    webhook.secret = `whsec_${Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
    this.store.setState({
      webhooks: this.store.getState().webhooks.map((w) => (w.id === id ? webhook : w)),
    });
    return { ...webhook };
  }

  // ── Refunds ──

  getRefunds(): PaymentRefund[] {
    return this.store.getState().refunds;
  }

  async issueRefund(input: IssueRefundAPIInput): Promise<{
    refund?: PaymentRefund;
    transaction?: PaymentTransaction;
    error?: string;
  }> {
    const result = await this.processor.refund(
      { transactionId: input.transactionId, amount: input.amount, reason: input.reason, notes: input.notes },
      this.store.getState().transactions
    );

    if (result.success && result.refund && result.transaction) {
      this.store.setState({
        refunds: [result.refund, ...this.store.getState().refunds],
        transactions: this.store.getState().transactions.map((t) =>
          t.id === result.transaction!.id ? result.transaction! : t
        ),
      });
    }

    return result;
  }

  // ── Checkout ──

  createCheckoutSession(data: CreateCheckoutSessionInput): CheckoutSession {
    return checkoutEngine.createSession({
      productId: data.productId,
      productName: data.productName,
      productPrice: data.productPrice,
      currency: data.currency || "usd",
      quantity: data.quantity,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      couponCode: data.couponCode,
    });
  }

  // ── Payments / Process ──

  async processPayment(input: CreatePaymentInput): Promise<{
    success: boolean;
    transaction?: PaymentTransaction;
    error?: string;
  }> {
    const result = await this.processor.process(input);
    if (result.success && result.transaction) {
      this.store.setState({
        transactions: [result.transaction, ...this.store.getState().transactions],
        totalRevenue: this.store.getState().totalRevenue + result.transaction.amount,
        totalTransactions: this.store.getState().totalTransactions + 1,
      });
    }
    return result;
  }

  // ── KPIs ──

  getKPIs() {
    return computePaymentsKPI(this.store.getState());
  }

  // ── Webhook Delivery ──

  async deliverWebhook(webhookId: string, event: string, payload: Record<string, unknown>) {
    const webhook = this.store.getState().webhooks.find((w) => w.id === webhookId);
    if (!webhook) throw new Error("Webhook not found");
    const result = await webhookDeliverer.deliver(webhook, event, payload);
    this.store.setState({
      webhooks: this.store.getState().webhooks.map((w) =>
        w.id === webhookId
          ? { ...w, lastDeliveryAt: new Date().toISOString(), lastDeliveryStatus: result.success ? "success" as const : "failed" as const }
          : w
      ),
    });
    return result;
  }
}
