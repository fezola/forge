import { Module, Global } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DatabaseService } from '../application/database.service';
import { PrismaDatabaseRepository } from '../infrastructure/prisma-database.repository';
import { PrismaQueryExecutor } from '../infrastructure/prisma-query-executor';

@Global()
@Module({
  providers: [
    DatabaseService,
    PrismaClient,
    { provide: 'IDatabaseRepository', useClass: PrismaDatabaseRepository },
    { provide: 'IQueryExecutor', useClass: PrismaQueryExecutor },
  ],
  exports: [DatabaseService],
})
export class DatabaseEngineModule {}
