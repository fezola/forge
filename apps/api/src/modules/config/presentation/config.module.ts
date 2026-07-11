import { Module } from '@nestjs/common';
import { ConfigEngineModule } from '@forge/config-engine';
import { ConfigController } from './config.controller';

@Module({
  imports: [ConfigEngineModule],
  controllers: [ConfigController],
})
export class ConfigModule {}