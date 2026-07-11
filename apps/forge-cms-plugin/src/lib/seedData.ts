import {
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
} from "../types/payments";

const FIRST_NAMES = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hank", "Ivy", "Jack", "Kate", "Liam", "Mia", "Noah", "Olivia", "Paul", "Quinn", "Rosa", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xander", "Yara", "Zack"];
const LAST_NAMES = ["Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee"];
const PRODUCTS = [
  { name: "Pro Plan", type: "subscription", price: 2900 },
  { name: "Starter", type: "subscription", price: 900 },
  { name: "Enterprise", type: "subscription", price: 9900 },
  { name: "Setup Fee", type: "one-time", price: 4900 },
  { name: "API Credits (1K)", type: "one-time", price: 1000 },
  { name: "Storage 10GB", type: "usage-based", price: 500 },
  { name: "Analytics Addon", type: "subscription", price: 1500 },
  { name: "Team Seat", type: "subscription", price: 2500 },
];
const PROVIDERS: { name: string; type: PaymentProvider["type"] }[] = [
  { name: "Stripe", type: "stripe" },
  { name: "Paystack", type: "paystack" },
  { name: "Coinbase Commerce", type: "coinbase" },
];
const WEBHOOK_EVENTS = ["payment.completed", "payment.failed", "subscription.created", "subscription.canceled", "customer.created", "invoice.paid"];
const REFUND_REASONS = ["customer_request", "duplicate", "product_issue", "fraud", "other"];

function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomPick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDate(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, daysBack));
  d.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  return d.toISOString();
}
function randomEmail(name: string): string {
  const domains = ["gmail.com", "outlook.com", "co.com", "example.com", "acmecorp.com"];
  return `${name.toLowerCase().replace(/\s/g, ".")}@${randomPick(domains)}`;
}
function randomPhone(): string {
  return `+1 (${randomInt(200, 999)}) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
}

export function generateSeedData(): PaymentsState {
  const customers: PaymentCustomer[] = [];
  const transactions: PaymentTransaction[] = [];
  const subscriptions: PaymentSubscription[] = [];
  const invoices: PaymentInvoice[] = [];
  const refunds: PaymentRefund[] = [];

  // Generate customers
  for (let i = 0; i < 24; i++) {
    const name = `${randomPick(FIRST_NAMES)} ${randomPick(LAST_NAMES)}`;
    const createdAt = randomDate(90);
    const txCount = randomInt(1, 8);
    const totalSpent = txCount * randomInt(900, 9900);
    customers.push({
      id: `cus_${String(i + 1).padStart(3, "0")}`,
      name,
      email: randomEmail(name),
      phone: randomPhone(),
      avatar: "",
      totalSpent,
      totalTransactions: txCount,
      currency: "usd",
      createdAt,
      updatedAt: randomDate(7),
      metadata: {},
    });
  }

  // Generate transactions
  for (let i = 0; i < 60; i++) {
    const customer = randomPick(customers);
    const product = randomPick(PRODUCTS);
    const statuses: PaymentTransaction["status"][] = ["succeeded", "succeeded", "succeeded", "succeeded", "pending", "failed", "refunded"];
    const status = randomPick(statuses);
    const createdAt = randomDate(60);

    transactions.push({
      id: `txn_${String(i + 1).padStart(4, "0")}`,
      amount: product.price,
      currency: "usd",
      status,
      customerId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      productId: `prod_${String(product.name.charCodeAt(0))}`,
      productName: product.name,
      description: `${product.type} purchase`,
      paymentMethod: randomPick(["Visa •••4242", "Visa •••1234", "Mastercard •••5678", "Amex •••9001", "USDC (Solana)", "SOL"]),
      invoiceId: `inv_${String(i + 1).padStart(4, "0")}`,
      createdAt,
      updatedAt: createdAt,
      metadata: {},
    });

    // Generate refunds for some transactions
    if (status === "refunded" || (status === "succeeded" && Math.random() < 0.1)) {
      refunds.push({
        id: `rfnd_${String(i + 1).padStart(3, "0")}`,
        transactionId: transactions[transactions.length - 1].id,
        amount: Math.round(product.price * (Math.random() < 0.7 ? 1 : 0.5)),
        currency: "usd",
        reason: randomPick(REFUND_REASONS),
        status: randomPick(["succeeded", "succeeded", "succeeded", "pending", "failed"]),
        notes: "Processed via dashboard",
        createdAt: randomDate(10),
      });
    }

    // Generate invoice
    const invoiceStatuses: PaymentInvoice["status"][] = ["paid", "paid", "paid", "open", "draft", "void"];
    const invoiceStatus = randomPick(invoiceStatuses);
    const items: PaymentInvoiceItem[] = [{
      id: `item_${i}`,
      description: product.name,
      quantity: randomInt(1, 3),
      unitAmount: product.price,
      amount: product.price,
      currency: "usd",
    }];
    invoices.push({
      id: `inv_${String(i + 1).padStart(4, "0")}`,
      number: `INV-2026-${String(i + 1).padStart(4, "0")}`,
      customerId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      subscriptionId: "",
      status: invoiceStatus,
      amount: product.price,
      amountPaid: invoiceStatus === "paid" ? product.price : 0,
      amountDue: invoiceStatus === "paid" ? 0 : product.price,
      currency: "usd",
      items,
      dueDate: randomDate(30),
      paidAt: invoiceStatus === "paid" ? randomDate(5) : "",
      createdAt: randomDate(60),
      pdfUrl: "",
      notes: "",
    });
  }

  // Generate subscriptions
  for (let i = 0; i < 20; i++) {
    const customer = randomPick(customers);
    const product = PRODUCTS.filter((p) => p.type === "subscription")[i % 3];
    const statuses: PaymentSubscription["status"][] = ["active", "active", "active", "trialing", "past_due", "canceled", "paused"];
    subscriptions.push({
      id: `sub_${String(i + 1).padStart(3, "0")}`,
      customerId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      productId: `prod_${String(product.name.charCodeAt(0))}`,
      productName: product.name,
      status: randomPick(statuses),
      amount: product.price,
      currency: "usd",
      interval: "month",
      intervalCount: 1,
      trialDays: 14,
      trialEnd: randomDate(20),
      currentPeriodStart: randomDate(30),
      currentPeriodEnd: randomDate(-30),
      canceledAt: "",
      endedAt: "",
      createdAt: randomDate(90),
      metadata: {},
    });
  }

  // Coupons
  const coupons: PaymentCoupon[] = [
    { id: "coup_001", code: "SUMMER2026", type: "percentage", value: 25, appliesTo: "all", maxRedemptions: 1000, timesRedeemed: 342, minOrderAmount: 1000, duration: "once", durationMonths: 0, activeFrom: randomDate(60), activeUntil: randomDate(-30), isActive: true, createdAt: randomDate(60) },
    { id: "coup_002", code: "WELCOME10", type: "percentage", value: 10, appliesTo: "all", maxRedemptions: 5000, timesRedeemed: 1523, minOrderAmount: 0, duration: "once", durationMonths: 0, activeFrom: randomDate(90), activeUntil: randomDate(-60), isActive: true, createdAt: randomDate(90) },
    { id: "coup_003", code: "FLAT50", type: "fixed", value: 50, appliesTo: "all", maxRedemptions: 500, timesRedeemed: 87, minOrderAmount: 5000, duration: "once", durationMonths: 0, activeFrom: randomDate(45), activeUntil: randomDate(-15), isActive: true, createdAt: randomDate(45) },
    { id: "coup_004", code: "TEAM20", type: "percentage", value: 20, appliesTo: "all", maxRedemptions: 200, timesRedeemed: 12, minOrderAmount: 0, duration: "limited", durationMonths: 3, activeFrom: randomDate(30), activeUntil: randomDate(-60), isActive: false, createdAt: randomDate(30) },
  ];

  // Payment links
  const paymentLinks: PaymentLink[] = [
    { id: "pl_001", name: "Pro Plan Checkout", url: "forge.pay/pro-plan-abc", productId: "prod_001", productName: "Pro Plan", allowQuantity: true, checkoutStyle: "minimal", views: 1284, checkouts: 342, revenue: 991800, isActive: true, createdAt: randomDate(60) },
    { id: "pl_002", name: "Enterprise Sale", url: "forge.pay/enterprise-def", productId: "prod_003", productName: "Enterprise", allowQuantity: false, checkoutStyle: "branded", views: 456, checkouts: 89, revenue: 881100, isActive: true, createdAt: randomDate(45) },
    { id: "pl_003", name: "API Credits Top-up", url: "forge.pay/api-credits-ghi", productId: "prod_005", productName: "API Credits (1K)", allowQuantity: true, checkoutStyle: "minimal", views: 2341, checkouts: 1203, revenue: 1203000, isActive: false, createdAt: randomDate(90) },
  ];

  // Providers
  const providers: PaymentProvider[] = PROVIDERS.map((p, i) => ({
    id: `prov_${String(i + 1).padStart(3, "0")}`,
    name: p.name,
    type: p.type,
    connected: i === 0,
    environment: i === 0 ? "test" : "live",
    accountName: i === 0 ? "Test Account" : "Not Connected",
    createdAt: randomDate(90),
  }));

  // Wallets
  const wallets: WalletConnection[] = [
    { id: "wal_001", network: "Solana", address: "7S3...Jk9q", label: "Phantom Wallet", balance: 142.5, balanceUsd: 24842, connectedAt: randomDate(60), isActive: true },
    { id: "wal_002", network: "Ethereum", address: "0x9f4...b3e2", label: "MetaMask", balance: 8.2, balanceUsd: 14760, connectedAt: randomDate(45), isActive: true },
  ];

  // Webhooks
  const webhooks: PaymentWebhook[] = [
    { id: "wh_001", url: "https://api.myapp.com/webhooks/payments", description: "Payment events", secret: "whsec_abc123", events: ["payment.completed", "payment.failed"], isActive: true, lastDeliveryAt: randomDate(1), lastDeliveryStatus: "success", createdAt: randomDate(90) },
    { id: "wh_002", url: "https://api.myapp.com/webhooks/subscriptions", description: "Subscription events", secret: "whsec_def456", events: ["subscription.created", "subscription.canceled", "subscription.updated"], isActive: true, lastDeliveryAt: randomDate(2), lastDeliveryStatus: "success", createdAt: randomDate(80) },
    { id: "wh_003", url: "https://myapp.com/old-webhook", description: "Legacy", secret: "whsec_old789", events: ["payment.completed"], isActive: false, lastDeliveryAt: randomDate(30), lastDeliveryStatus: "failed", createdAt: randomDate(120) },
  ];

  // Calculate totals
  const totalRevenue = transactions.filter(t => t.status === "succeeded").reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = transactions.length;
  const mrr = subscriptions.filter(s => s.status === "active" || s.status === "trialing").reduce((sum, s) => sum + s.amount, 0);
  const conversionRate = 26.6; // hardcoded for realism

  return {
    transactions,
    customers,
    subscriptions,
    invoices,
    coupons,
    paymentLinks,
    providers,
    wallets,
    webhooks,
    refunds,
    mrr,
    totalRevenue,
    totalTransactions,
    conversionRate,
  };
}
