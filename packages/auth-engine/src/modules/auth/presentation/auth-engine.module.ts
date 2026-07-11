import { Module, Global, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import Redis from 'ioredis';
import { AuthService } from '../application/auth.service';
import { JwtTokenService } from '../infrastructure/jwt-token.service';
import { BcryptPasswordHasher } from '../infrastructure/bcrypt-password-hasher';
import { JwtStrategy } from '../infrastructure/jwt.strategy';
import { RedisAuthRepository } from '../infrastructure/redis-auth.repository';

const RedisProvider: Provider = {
  provide: Redis,
  useFactory: () => {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    return new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2000)),
      connectTimeout: 10000,
      lazyConnect: true,
    });
  },
};

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
    RedisProvider,
    { provide: 'ITokenService', useClass: JwtTokenService },
    { provide: 'IPasswordHasher', useClass: BcryptPasswordHasher },
    { provide: 'IAuthRepository', useClass: RedisAuthRepository },
  ],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthEngineModule {}
