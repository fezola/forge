import { ActionFieldDefinition } from './action.types';

export type TriggerType = 'polling' | 'webhook';

export interface TriggerDefinition {
  id: string;
  connectorId: string;
  name: string;
  description: string;
  type: TriggerType;
  pollingInterval?: number;
  input: ActionFieldDefinition[];
  output: ActionFieldDefinition[];
  path?: string;
}
