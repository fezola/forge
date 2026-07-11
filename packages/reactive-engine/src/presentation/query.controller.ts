import { Controller, Post, Body } from '@nestjs/common';
import { LiveQueryService } from '../application/live-query.service';
import { QueryExecuteRequest } from '@forge/reactive-types';

@Controller('queries')
export class QueryController {
  constructor(private readonly queries: LiveQueryService) {}

  @Post('execute')
  execute(@Body() input: QueryExecuteRequest) {
    return this.queries.execute(input);
  }

  @Post('count')
  estimateCount(@Body() input: QueryExecuteRequest) {
    return this.queries.estimateCount(input);
  }
}
