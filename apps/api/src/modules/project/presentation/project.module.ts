import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ProjectController } from './project.controller';
import { ProjectService } from '../application/project.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, PrismaClient],
})
export class ProjectModule {}
