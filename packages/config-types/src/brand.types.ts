export interface BrandConfig {
  id: string;
  projectId: string;
  appName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  email: EmailBranding;
  auth: AuthScreenBranding;
  invoice: InvoiceBranding;
  dashboard: DashboardBranding;
  customCss?: string;
  customVariables?: Record<string, string>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface EmailBranding {
  logoUrl?: string;
  primaryColor?: string;
  footerText?: string;
  companyName?: string;
  companyAddress?: string;
  unsubscribeLink?: boolean;
  customFooterHtml?: string;
}

export interface AuthScreenBranding {
  logoUrl?: string;
  backgroundColor?: string;
  primaryColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  termsUrl?: string;
  privacyUrl?: string;
  helpUrl?: string;
}

export interface InvoiceBranding {
  logoUrl?: string;
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  taxId?: string;
  currency?: string;
  footer?: string;
}

export interface DashboardBranding {
  logoUrl?: string;
  faviconUrl?: string;
  title?: string;
  primaryColor?: string;
  sidebarColor?: string;
  sidebarTextColor?: string;
  customCss?: string;
}

export interface BrandConfigInput {
  appName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  email?: EmailBranding;
  auth?: AuthScreenBranding;
  invoice?: InvoiceBranding;
  dashboard?: DashboardBranding;
  customCss?: string;
  customVariables?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface BlockchainConfig {
  id: string;
  projectId: string;
  chain: string;
  network: string;
  rpcUrl?: string;
  wsUrl?: string;
  explorerUrl?: string;
  chainId?: number;
  commitment?: string;
  blockTime?: number;
  confirmationBlocks?: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface BlockchainConfigInput {
  chain: string;
  network: string;
  rpcUrl?: string;
  wsUrl?: string;
  explorerUrl?: string;
  chainId?: number;
  commitment?: string;
  blockTime?: number;
  confirmationBlocks?: number;
  metadata?: Record<string, unknown>;
}

export interface AiConfig {
  id: string;
  projectId: string;
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  defaultTopP?: number;
  defaultFrequencyPenalty?: number;
  defaultPresencePenalty?: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AiConfigInput {
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  defaultTopP?: number;
  defaultFrequencyPenalty?: number;
  defaultPresencePenalty?: number;
  metadata?: Record<string, unknown>;
}