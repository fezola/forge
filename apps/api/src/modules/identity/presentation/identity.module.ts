import { Module } from '@nestjs/common';
import { IdentityEngineModule } from '@forge/identity-engine';
import { IdentityController } from './identity.controller';

@Module({
  imports: [IdentityEngineModule],
  controllers: [IdentityController],
})
export class IdentityModule {}