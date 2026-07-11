export type ResourceHealthStatus = 'healthy' | 'running' | 'failed' | 'offline' | 'paused' | 'deploying' | 'unknown';

export interface ResourceHealth {
  resourceId: string;
  resourceType: string;
  status: ResourceHealthStatus;
  message?: string;
  lastCheckedAt: string;
  lastHealthyAt?: string;
  uptimePercent?: number;
  metrics?: Record<string, number>;
  checks?: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  durationMs?: number;
  lastCheckedAt: string;
}

export interface HealthCheckResult {
  resourceId: string;
  healthy: boolean;
  status: ResourceHealthStatus;
  checks: HealthCheck[];
  timestamp: string;
}