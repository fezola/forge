export interface ReactiveState {
  id: string;
  projectId: string;
  data: Record<string, unknown>;
  version: number;
  updatedAt: string;
}

export interface StateChange {
  bindingId: string;
  previous: unknown;
  current: unknown;
  timestamp: string;
}

export interface StateSnapshot {
  bindings: Record<string, unknown>;
  queries: Record<string, unknown>;
  variables: Record<string, unknown>;
}
