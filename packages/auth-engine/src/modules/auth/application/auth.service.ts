import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { IAuthRepository } from '../domain/auth.repository.interface';
import { ITokenService } from '../domain/token.service.interface';
import { IPasswordHasher } from '../domain/password-hasher.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async register(dto: { email: string; name: string; password: string }) {
    const existing = await this.authRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const hashedPassword = await this.passwordHasher.hash(dto.password);
    const user = await this.authRepository.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
    });
    return this.generateTokens(user.id, user.email);
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = await this.passwordHasher.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user.id, user.email);
  }

  async refresh(refreshToken: string) {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const stored = await this.authRepository.findRefreshToken(refreshToken);
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    await this.authRepository.deleteRefreshToken(refreshToken);
    const user = await this.authRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.generateTokens(user.id, user.email);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.authRepository.deleteRefreshToken(refreshToken);
  }

  private async generateTokens(userId: string, email: string) {
    const accessToken = this.tokenService.generateAccessToken({ sub: userId, email });
    const refreshToken = this.tokenService.generateRefreshToken({ sub: userId });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.authRepository.saveRefreshToken(userId, refreshToken, expiresAt);
    return { accessToken, refreshToken, expiresIn: 900 };
  }
}
