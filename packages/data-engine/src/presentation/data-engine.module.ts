import { Module, Global, OnModuleInit } from '@nestjs/common';
import { QueryEngineService } from '../application/query-engine.service';
import { PostgresQueryTranslator } from '../infrastructure/query/postgres-query-translator';
import { QueryValidator } from '../infrastructure/query/query-validator';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true }),
  ],
  providers: [
    QueryEngineService,
    PostgresQueryTranslator,
    QueryValidator,
  ],
  exports: [QueryEngineService, PostgresQueryTranslator, QueryValidator],
})
export class DataEngineModule implements OnModuleInit {
  constructor(
    private readonly queryEngine: QueryEngineService,
    private readonly pgTranslator: PostgresQueryTranslator,
  ) {}

  onModuleInit() {
    this.queryEngine.registerTranslator(this.pgTranslator);
  }
}