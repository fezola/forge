import { Module } from '@nestjs/common';
import { AuthEngineModule } from '@forge/auth-engine';
import { AuthController } from './auth.controller';

@Module({
  imports: [AuthEngineModule],
  controllers: [AuthController],
})
export class AuthModule {}
