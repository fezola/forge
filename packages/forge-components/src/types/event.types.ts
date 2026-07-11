export type ForgeEventType =
  | 'click'
  | 'submit'
  | 'change'
  | 'focus'
  | 'blur'
  | 'success'
  | 'error'
  | 'loading'
  | 'connect'
  | 'disconnect'
  | 'payment_complete'
  | 'wallet_connected'
  | 'transaction_confirmed'
  | 'file_uploaded'
  | 'ai_generated';

export interface ForgeEvent {
  type: ForgeEventType;
  source: string;
  data?: unknown;
  timestamp: string;
}

export type ForgeEventCallback = (event: ForgeEvent) => void;
