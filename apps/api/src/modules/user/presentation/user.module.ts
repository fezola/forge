import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserController } from './user.controller';
import { UserService } from '../application/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaClient],
})
export class UserModule {}
