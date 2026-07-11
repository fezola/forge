export class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number | null = null;
  private onRefresh: (() => Promise<{ accessToken: string; refreshToken: string; expiresIn: number }>) | null = null;

  constructor(private readonly storage: TokenStorage = new MemoryTokenStorage()) {
    this.load();
  }

  getToken(): string | null {
    if (this.expiresAt && Date.now() > this.expiresAt) {
      return null;
    }
    return this.accessToken;
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = Date.now() + expiresIn * 1000;
    this.persist();
  }

  clear(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
    this.storage.remove('accessToken');
    this.storage.remove('refreshToken');
    this.storage.remove('expiresAt');
  }

  setRefreshHandler(handler: () => Promise<{ accessToken: string; refreshToken: string; expiresIn: number }>): void {
    this.onRefresh = handler;
  }

  async ensureValidToken(): Promise<string | null> {
    if (this.getToken()) return this.accessToken;
    if (this.refreshToken && this.onRefresh) {
      const result = await this.onRefresh();
      this.setTokens(result.accessToken, result.refreshToken, result.expiresIn);
      return this.accessToken;
    }
    return null;
  }

  private persist(): void {
    if (this.accessToken) this.storage.set('accessToken', this.accessToken);
    if (this.refreshToken) this.storage.set('refreshToken', this.refreshToken);
    if (this.expiresAt) this.storage.set('expiresAt', String(this.expiresAt));
  }

  private load(): void {
    this.accessToken = this.storage.get('accessToken');
    this.refreshToken = this.storage.get('refreshToken');
    const exp = this.storage.get('expiresAt');
    this.expiresAt = exp ? parseInt(exp, 10) : null;
  }
}

interface TokenStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

class MemoryTokenStorage implements TokenStorage {
  private store = new Map<string, string>();
  get(key: string): string | null { return this.store.get(key) ?? null; }
  set(key: string, value: string): void { this.store.set(key, value); }
  remove(key: string): void { this.store.delete(key); }
}

export class LocalStorageTokenStorage implements TokenStorage {
  get(key: string): string | null { return localStorage.getItem(key); }
  set(key: string, value: string): void { localStorage.setItem(key, value); }
  remove(key: string): void { localStorage.removeItem(key); }
}