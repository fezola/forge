import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Session, CreateSessionRequest, SessionStatus, ISessionStore } from '@forge/identity-types';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PrismaSessionStore implements ISessionStore {
  constructor(private readonly prisma: PrismaClient) {}

  async create(request: CreateSessionRequest, accessToken: string, refreshToken: string, expiresIn: number): Promise<Session> {
    const now = new Date();
    const data = await (this.prisma as any).session.create({
      data: {
        id: uuid(),
        identityId: request.identityId,
        projectId: request.projectId,
        accessToken,
        refreshToken,
        refreshTokenExpiresAt: new Date(now.getTime() + expiresIn).toISOString(),
        status: 'active',
        deviceInfo: request.deviceInfo as any,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        location: null,
        lastActivityAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + expiresIn).toISOString(),
      },
    });
    return this.toSession(data);
  }

  async findById(id: string): Promise<Session | null> {
    const data = await (this.prisma as any).session.findUnique({ where: { id } });
    return data ? this.toSession(data) : null;
  }

  async findByIdentity(identityId: string): Promise<Session[]> {
    const data = await (this.prisma as any).session.findMany({
      where: { identityId, status: 'active' },
      orderBy: { lastActivityAt: 'desc' },
    });
    return data.map((s: any) => this.toSession(s));
  }

  async revoke(id: string): Promise<void> {
    await (this.prisma as any).session.update({
      where: { id },
      data: { status: 'revoked' },
    });
  }

  async revokeAll(identityId: string, exceptSessionId?: string): Promise<void> {
    const where: any = { identityId };
    if (exceptSessionId) where.id = { not: exceptSessionId };
    await (this.prisma as any).session.updateMany({
      where,
      data: { status: 'revoked' },
    });
  }

  async refresh(id: string, newAccessToken: string, newRefreshToken: string, expiresIn: number): Promise<Session> {
    const now = new Date();
    const data = await (this.prisma as any).session.update({
      where: { id },
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt: new Date(now.getTime() + expiresIn).toISOString(),
        lastActivityAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + expiresIn).toISOString(),
      },
    });
    return this.toSession(data);
  }

  async cleanExpired(): Promise<number> {
    const result = await (this.prisma as any).session.updateMany({
      where: { expiresAt: { lt: new Date().toISOString() }, status: 'active' },
      data: { status: 'expired' },
    });
    return result.count ?? 0;
  }

  private toSession(data: any): Session {
    return {
      id: data.id,
      identityId: data.identityId,
      projectId: data.projectId,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      refreshTokenExpiresAt: data.refreshTokenExpiresAt,
      status: data.status as SessionStatus,
      deviceInfo: data.deviceInfo ?? { type: 'unknown', os: '', browser: '', model: null, trusted: false },
      ipAddress: data.ipAddress ?? '',
      userAgent: data.userAgent ?? '',
      location: data.location ?? null,
      lastActivityAt: data.lastActivityAt,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
    };
  }
}