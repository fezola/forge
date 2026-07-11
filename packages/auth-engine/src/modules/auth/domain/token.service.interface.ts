export interface ITokenService {
  generateAccessToken(payload: { sub: string; email: string }): string;
  generateRefreshToken(payload: { sub: string }): string;
  verifyAccessToken(token: string): { sub: string; email: string };
  verifyRefreshToken(token: string): { sub: string };
}
