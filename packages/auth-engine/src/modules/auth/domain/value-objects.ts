export class Email {
  private readonly value: string;

  constructor(email: string) {
    this.value = email.toLowerCase().trim();
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

export class Password {
  private readonly hashed: string;

  constructor(hashed: string) {
    this.hashed = hashed;
  }

  getValue(): string {
    return this.hashed;
  }
}

export class RefreshToken {
  constructor(
    public readonly token: string,
    public readonly expiresAt: Date,
  ) {}

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
