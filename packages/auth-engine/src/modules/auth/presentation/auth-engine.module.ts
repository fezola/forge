import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../application/auth.service';
import { JwtTokenService } from '../infrastructure/jwt-token.service';
import { BcryptPasswordHasher } from '../infrastructure/bcrypt-password-hasher';
import { JwtStrategy } from '../infrastructure/jwt.strategy';
import { RedisAuthRepository } from '../infrastructure/redis-auth.repository';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '15m' },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: 'ITokenService', useClass: JwtTokenService },
    { provide: 'IPasswordHasher', useClass: BcryptPasswordHasher },
    { provide: 'IAuthRepository', useClass: RedisAuthRepository },
  ],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthEngineModule {}
