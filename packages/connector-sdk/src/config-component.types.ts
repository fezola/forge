export interface ConnectorConfigComponent {
  key: string;
  label: string;
  type: 'text' | 'select' | 'toggle' | 'textarea' | 'file' | 'json';
  required: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
  description?: string;
}