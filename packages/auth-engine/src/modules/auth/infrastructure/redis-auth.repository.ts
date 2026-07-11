import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { IAuthRepository } from '../domain/auth.repository.interface';
import { User } from '@forge/types';

@Injectable()
export class RedisAuthRepository implements IAuthRepository {
  constructor(private readonly redis: Redis) {}

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.redis.get(`user:email:${email}`);
    return data ? JSON.parse(data) : null;
  }

  async findById(id: string): Promise<User | null> {
    const data = await this.redis.get(`user:id:${id}`);
    return data ? JSON.parse(data) : null;
  }

  async create(data: { email: string; name: string; password: string }): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.redis.set(`user:email:${data.email}`, JSON.stringify({ ...user, password: data.password }));
    await this.redis.set(`user:id:${user.id}`, JSON.stringify({ ...user, password: data.password }));
    return user;
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await this.redis.set(
      `refresh:${token}`,
      JSON.stringify({ userId, expiresAt }),
      'PXAT',
      expiresAt.getTime(),
    );
  }

  async findRefreshToken(token: string): Promise<{ userId: string; expiresAt: Date } | null> {
    const data = await this.redis.get(`refresh:${token}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.redis.del(`refresh:${token}`);
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    const keys = await this.redis.keys(`refresh:*`);
    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data && JSON.parse(data).userId === userId) {
        await this.redis.del(key);
      }
    }
  }
}
