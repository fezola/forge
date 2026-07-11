import { Injectable } from '@nestjs/common';
import { StateSnapshot } from '@forge/reactive-types';

@Injectable()
export class ReactiveStateService {
  private state: Map<string, Map<string, unknown>> = new Map();
  private version: Map<string, number> = new Map();

  set(projectId: string, key: string, value: unknown): void {
    if (!this.state.has(projectId)) {
      this.state.set(projectId, new Map());
      this.version.set(projectId, 0);
    }
    this.state.get(projectId)!.set(key, value);
    this.version.set(projectId, (this.version.get(projectId) || 0) + 1);
  }

  get(projectId: string, key: string): unknown {
    return this.state.get(projectId)?.get(key);
  }

  getAll(projectId: string): Record<string, unknown> {
    const map = this.state.get(projectId);
    if (!map) return {};
    return Object.fromEntries(map);
  }

  getSnapshot(projectId: string): StateSnapshot {
    const data = this.getAll(projectId);
    return {
      bindings: data,
      queries: data,
      variables: data,
    };
  }

  getVersion(projectId: string): number {
    return this.version.get(projectId) || 0;
  }

  invalidate(projectId: string): void {
    this.version.set(projectId, (this.version.get(projectId) || 0) + 1);
  }

  clear(projectId: string): void {
    this.state.delete(projectId);
    this.version.delete(projectId);
  }
}
