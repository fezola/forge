import type { ConfigEventType } from '@forge/config-types';

export const IConfigEventEmitter = Symbol('IConfigEventEmitter');

export interface IConfigEventEmitter {
  emit(eventType: ConfigEventType, payload: Record<string, unknown>): void;
  emitAsync(eventType: ConfigEventType, payload: Record<string, unknown>): Promise<void>;
}