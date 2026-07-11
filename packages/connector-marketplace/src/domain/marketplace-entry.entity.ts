export class MarketplaceEntryEntity {
  constructor(
    public readonly id: string,
    public readonly manifestId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly category: string,
    public readonly version: string,
    public readonly author: string,
    public readonly icon: string | null,
    public readonly downloads: number,
    public readonly rating: number,
    public readonly tags: string[],
    public readonly publishedAt: Date,
    public readonly updatedAt: Date,
    public readonly verified: boolean,
  ) {}

  static publish(input: {
    manifestId: string;
    name: string;
    description: string;
    category: string;
    version: string;
    author: string;
    icon?: string;
    tags?: string[];
  }): MarketplaceEntryEntity {
    return new MarketplaceEntryEntity(
      crypto.randomUUID(),
      input.manifestId,
      input.name,
      input.description,
      input.category,
      input.version,
      input.author,
      input.icon || null,
      0,
      0,
      input.tags || [],
      new Date(),
      new Date(),
      false,
    );
  }

  incrementDownloads(): void {
    this.downloads++;
    this.updatedAt = new Date();
  }
}
