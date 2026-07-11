import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { projects: true, sessions: true } } },
    });
    return users.map(({ password, ...user }) => user);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { projects: true, sessions: true } } },
    });
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  }

  async update(id: string, data: { name?: string; email?: string; avatar?: string }) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { _count: { select: { projects: true, sessions: true } } },
    });
    const { password, ...rest } = user;
    return rest;
  }

  async remove(id: string) {
    await this.prisma.user.delete({ where: { id } });
  }
}
