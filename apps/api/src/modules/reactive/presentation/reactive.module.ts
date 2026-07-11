import { Module } from '@nestjs/common';
import { ReactiveEngineModule } from '@forge/reactive-engine';
import { ReactiveController } from './reactive.controller';
import { ReactiveFacade } from '../application/reactive.facade';

@Module({
  imports: [ReactiveEngineModule],
  controllers: [ReactiveController],
  providers: [ReactiveFacade],
  exports: [ReactiveFacade],
})
export class ReactiveModule {}
