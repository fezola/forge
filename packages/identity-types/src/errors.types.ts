export class IdentityError extends Error {
  public readonly code: IdentityErrorCode;
  public readonly statusCode: number;
  public readonly details: Record<string, unknown> | undefined;

  constructor(code: IdentityErrorCode, message: string, statusCode: number = 400, details?: Record<string, unknown>) {
    super(message);
    this.name = 'IdentityError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export type IdentityErrorCode =
  | 'IDENTITY_NOT_FOUND'
  | 'IDENTITY_ALREADY_EXISTS'
  | 'IDENTITY_DISABLED'
  | 'IDENTITY_SUSPENDED'
  | 'INVALID_CREDENTIALS'
  | 'PROVIDER_ALREADY_LINKED'
  | 'PROVIDER_NOT_LINKED'
  | 'PROVIDER_UNAVAILABLE'
  | 'WALLET_ALREADY_LINKED'
  | 'WALLET_NOT_FOUND'
  | 'WALLET_VERIFICATION_FAILED'
  | 'SESSION_EXPIRED'
  | 'SESSION_INVALID'
  | 'SESSION_REVOKED'
  | 'ORGANIZATION_NOT_FOUND'
  | 'ORGANIZATION_SLUG_TAKEN'
  | 'ORGANIZATION_MEMBER_EXISTS'
  | 'ORGANIZATION_INVITE_EXPIRED'
  | 'ORGANIZATION_MAX_MEMBERS'
  | 'ROLE_NOT_FOUND'
  | 'ROLE_ALREADY_ASSIGNED'
  | 'PERMISSION_DENIED'
  | 'MFA_REQUIRED'
  | 'MFA_INVALID_CODE'
  | 'MFA_CHALLENGE_EXPIRED'
  | 'MFA_ALREADY_ENABLED'
  | 'MFA_NOT_ENABLED'
  | 'KYC_NOT_SUBMITTED'
  | 'KYC_ALREADY_SUBMITTED'
  | 'KYC_REJECTED'
  | 'KYC_PROVIDER_ERROR'
  | 'RECOVERY_CODE_USED'
  | 'PASSWORD_POLICY_VIOLATION'
  | 'RATE_LIMITED'
  | 'PROVIDER_CONFIG_INVALID';