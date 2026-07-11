export type MfaMethod = 'authenticator_app' | 'passkey' | 'email_otp' | 'sms_otp' | 'recovery_code';

export interface MfaConfiguration {
  id: string;
  identityId: string;
  method: MfaMethod;
  enabled: boolean;
  verifiedAt: string | null;
  createdAt: string;
}

export interface AuthenticatorAppConfig extends MfaConfiguration {
  method: 'authenticator_app';
  secret: string;
  qrCodeUri: string;
}

export interface PasskeyMfaConfig extends MfaConfiguration {
  method: 'passkey';
  credentialId: string;
  publicKey: string;
}

export interface EmailOtpConfig extends MfaConfiguration {
  method: 'email_otp';
  email: string;
}

export interface SmsOtpConfig extends MfaConfiguration {
  method: 'sms_otp';
  phone: string;
}

export interface RecoveryCodesConfig extends MfaConfiguration {
  method: 'recovery_code';
  codes: string[];
}

export type MfaConfig = AuthenticatorAppConfig | PasskeyMfaConfig | EmailOtpConfig | SmsOtpConfig | RecoveryCodesConfig;

export interface MfaChallenge {
  challengeId: string;
  identityId: string;
  method: MfaMethod;
  code: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
}

export interface IMfaService {
  enable(method: MfaMethod, identityId: string, config?: Record<string, unknown>): Promise<MfaConfig>;
  disable(id: string, identityId: string): Promise<void>;
  challenge(identityId: string, method: MfaMethod): Promise<MfaChallenge>;
  verify(challengeId: string, code: string): Promise<boolean>;
  getEnabledMethods(identityId: string): Promise<MfaConfig[]>;
  isMfaRequired(identityId: string): Promise<boolean>;
  generateRecoveryCodes(identityId: string): Promise<string[]>;
}