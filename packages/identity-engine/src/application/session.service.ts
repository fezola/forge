import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { ISessionStore } from '@forge/identity-types';
import { Session, SessionSummary } from '@forge/identity-types';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SessionService {
  constructor(
    @Inject('ISessionStore')
    private readonly sessionStore: ISessionStore,
  ) {}

  async create(
    identityId: string,
    projectId: string,
    meta: { ipAddress: string; userAgent: string; deviceInfo: Record<string, unknown> },
  ): Promise<Session> {
    const accessToken = this.generateToken();
    const refreshToken = this.generateToken();
    const expiresIn = 7 * 24 * 60 * 60 * 1000;

    return this.sessionStore.create(
      {
        identityId,
        projectId,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        deviceInfo: meta.deviceInfo as any,
      },
      accessToken,
      refreshToken,
      expiresIn,
    );
  }

  async findById(id: string): Promise<Session | null> {
    return this.sessionStore.findById(id);
  }

  async findByIdentity(identityId: string): Promise<Session[]> {
    return this.sessionStore.findByIdentity(identityId);
  }

  async revoke(id: string): Promise<void> {
    await this.sessionStore.revoke(id);
  }

  async revokeAll(identityId: string, exceptSessionId?: string): Promise<void> {
    await this.sessionStore.revokeAll(identityId, exceptSessionId);
  }

  async refresh(id: string): Promise<Session> {
    const session = await this.sessionStore.findById(id);
    if (!session || session.status !== 'active') {
      throw new UnauthorizedException('Session not found or expired');
    }
    const newAccessToken = this.generateToken();
    const newRefreshToken = this.generateToken();
    const expiresIn = 7 * 24 * 60 * 60 * 1000;
    return this.sessionStore.refresh(id, newAccessToken, newRefreshToken, expiresIn);
  }

  async getSummaries(identityId: string, currentSessionId?: string): Promise<SessionSummary[]> {
    const sessions = await this.sessionStore.findByIdentity(identityId);
    return sessions.map(s => ({
      id: s.id,
      deviceInfo: s.deviceInfo,
      ipAddress: s.ipAddress,
      lastActivityAt: s.lastActivityAt,
      createdAt: s.createdAt,
      status: s.status,
      isCurrent: s.id === currentSessionId,
    }));
  }

  async cleanExpired(): Promise<number> {
    return this.sessionStore.cleanExpired();
  }

  private generateToken(): string {
    return uuid().replace(/-/g, '') + uuid().replace(/-/g, '');
  }
}