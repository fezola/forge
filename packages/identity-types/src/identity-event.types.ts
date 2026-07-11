export type IdentityEventType =
  | 'identity.created'
  | 'identity.updated'
  | 'identity.deleted'
  | 'identity.login'
  | 'identity.logout'
  | 'identity.email_verified'
  | 'identity.phone_verified'
  | 'identity.password_changed'
  | 'identity.status_changed'
  | 'wallet.linked'
  | 'wallet.unlinked'
  | 'wallet.verified'
  | 'session.created'
  | 'session.revoked'
  | 'session.expired'
  | 'role.assigned'
  | 'role.removed'
  | 'organization.created'
  | 'organization.joined'
  | 'organization.left'
  | 'organization.member_added'
  | 'organization.member_removed'
  | 'organization.member_role_changed'
  | 'mfa.enabled'
  | 'mfa.disabled'
  | 'mfa.challenge_completed'
  | 'kyc.submitted'
  | 'kyc.approved'
  | 'kyc.rejected'
  | 'kyc.expired';

export interface IdentityEvent {
  id: string;
  type: IdentityEventType;
  projectId: string;
  identityId: string;
  timestamp: string;
  data: Record<string, unknown>;
  source: 'api' | 'sdk' | 'system' | 'provider';
  ipAddress?: string;
  userAgent?: string;
}

export interface IdentityEventPayload {
  type: IdentityEventType;
  projectId: string;
  identityId: string;
  data: Record<string, unknown>;
  source: 'api' | 'sdk' | 'system' | 'admin';
  ipAddress?: string;
  userAgent?: string;
}

export type IdentityEventHandler = (event: IdentityEvent) => void | Promise<void>;

export interface IIdentityEventBus {
  emit(payload: IdentityEventPayload): Promise<IdentityEvent>;
  subscribe(type: IdentityEventType | '*', handler: IdentityEventHandler): void;
  unsubscribe(type: IdentityEventType | '*', handler: IdentityEventHandler): void;
}