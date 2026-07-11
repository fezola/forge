export type SessionStatus = 'active' | 'expired' | 'revoked' | 'suspended';

export type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'unknown';

export interface Session {
  id: string;
  identityId: string;
  projectId: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  status: SessionStatus;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  location: string | null;
  lastActivityAt: string;
  createdAt: string;
  expiresAt: string;
}

export interface DeviceInfo {
  type: DeviceType;
  os: string;
  browser: string;
  model: string | null;
  trusted: boolean;
}

export interface CreateSessionRequest {
  identityId: string;
  projectId: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo: Partial<DeviceInfo>;
}

export interface SessionSummary {
  id: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  lastActivityAt: string;
  createdAt: string;
  status: SessionStatus;
  isCurrent: boolean;
}

export interface ISessionStore {
  create(request: CreateSessionRequest, accessToken: string, refreshToken: string, expiresIn: number): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByIdentity(identityId: string): Promise<Session[]>;
  revoke(id: string): Promise<void>;
  revokeAll(identityId: string, exceptSessionId?: string): Promise<void>;
  refresh(id: string, newAccessToken: string, newRefreshToken: string, expiresIn: number): Promise<Session>;
  cleanExpired(): Promise<number>;
}