export interface UsageRecord {
  id: string;
  subscriptionId: string;
  metric: string;
  quantity: number;
  recordedAt: string;
}

export interface UsageSummary {
  metric: string;
  total: number;
  periodStart: string;
  periodEnd: string;
}
