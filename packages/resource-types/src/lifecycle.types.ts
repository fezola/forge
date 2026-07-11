export type LifecycleTransitionAction = 'create' | 'activate' | 'archive' | 'restore' | 'delete' | 'draft';

export interface LifecycleTransition {
  from: string;
  to: string;
  action: LifecycleTransitionAction;
}

export const DEFAULT_LIFECYCLE_TRANSITIONS: LifecycleTransition[] = [
  { from: 'creating', to: 'draft', action: 'create' },
  { from: 'creating', to: 'active', action: 'activate' },
  { from: 'draft', to: 'active', action: 'activate' },
  { from: 'active', to: 'archived', action: 'archive' },
  { from: 'archived', to: 'active', action: 'restore' },
  { from: 'active', to: 'deleted', action: 'delete' },
  { from: 'archived', to: 'deleted', action: 'delete' },
  { from: 'draft', to: 'deleted', action: 'delete' },
  { from: 'creating', to: 'deleted', action: 'delete' },
];

export interface LifecyclePolicy {
  type: string;
  allowedTransitions: LifecycleTransition[];
  autoArchiveDays?: number;
  autoDeleteDays?: number;
  requireApprovalFor?: string[];
}