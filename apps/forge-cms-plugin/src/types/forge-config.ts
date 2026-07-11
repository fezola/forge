export type ProductType = "one-time" | "subscription" | "usage-based";

export interface ForgeProduct {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  currency: string;
  redirectPath: string;
  description: string;
  active: boolean;
}

export interface StripeConfig {
  connected: boolean;
  publishableKey: string;
  secretKey: string;
  accountName: string;
}

export interface AuthSettings {
  redirectAfterSignIn: string;
  redirectAfterSignUp: string;
  allowMagicLink: boolean;
  allowOAuth: boolean;
}

export interface ForgeGlobalConfig {
  projectName: string;
  stripe: StripeConfig;
  products: ForgeProduct[];
  auth: AuthSettings;
  siteUrl: string;
  onboardingComplete: boolean;
}

export const DEFAULT_CONFIG: ForgeGlobalConfig = {
  projectName: "My Project",
  stripe: {
    connected: false,
    publishableKey: "",
    secretKey: "",
    accountName: "",
  },
  products: [],
  auth: {
    redirectAfterSignIn: "/dashboard",
    redirectAfterSignUp: "/dashboard",
    allowMagicLink: true,
    allowOAuth: true,
  },
  siteUrl: "",
  onboardingComplete: false,
};

export const FORGE_CONFIG_KEY = "forgeGlobalConfig";
