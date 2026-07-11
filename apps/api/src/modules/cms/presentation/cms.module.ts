import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { SyncProcessor } from './sync-processor.service';

@Module({
  controllers: [CmsController],
  providers: [CmsService, SyncProcessor, PrismaClient],
})
export class CmsModule {}