export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  interval: string;
  trialDays: number;
  sortOrder: number;
  active: boolean;
  public: boolean;
  maxProjects?: number | null;
  maxStorageGb?: number | null;
  maxIdentities?: number | null;
  maxBandwidthGb?: number | null;
  maxApiRequests?: number | null;
  features: PlanFeature[];
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeature {
  id: string;
  planId: string;
  key: string;
  name: string;
  value: string;
  highlight: boolean;
}

export type PlanInterval = 'month' | 'year' | 'week' | 'day';
