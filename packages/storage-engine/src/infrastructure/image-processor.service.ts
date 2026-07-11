import { Injectable, Logger } from '@nestjs/common';
import type {
  ImageProcessingOptions, TransformOptions, ImageTransformResult,
} from '@forge/storage-types';
import { StorageError } from '@forge/storage-types';
import type { IImageProcessor } from '../domain/storage-interfaces';

@Injectable()
export class ImageProcessorService implements IImageProcessor {
  private readonly logger = new Logger(ImageProcessorService.name);
  private sharpModule: any = null;

  private async getSharp(): Promise<any> {
    if (!this.sharpModule) {
      try {
        this.sharpModule = await import('sharp');
      } catch {
        this.logger.warn('sharp module not available — image processing disabled');
        return null;
      }
    }
    return this.sharpModule;
  }

  canHandle(mimeType: string): boolean {
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/tiff', 'image/svg+xml', 'image/heic'];
    return imageTypes.includes(mimeType);
  }

  async getInfo(buffer: Buffer): Promise<{ width: number; height: number; format: string; hasAlpha: boolean; orientation?: number }> {
    const sharp = await this.getSharp();
    if (!sharp) throw new StorageError('IMAGE_PROCESSING_FAILED', 'Image processing not available', 501);

    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      hasAlpha: metadata.hasAlpha || false,
      orientation: metadata.orientation,
    };
  }

  async process(
    buffer: Buffer,
    options: ImageProcessingOptions,
  ): Promise<{ buffer: Buffer; format: string; width: number; height: number }> {
    const sharp = await this.getSharp();
    if (!sharp) throw new StorageError('IMAGE_PROCESSING_FAILED', 'Image processing not available', 501);

    let pipeline = sharp(buffer);

    if (options.autoOrient) {
      pipeline = pipeline.rotate();
    }

    if (options.resize) {
      pipeline = pipeline.resize(options.resize.width, options.resize.height, {
        fit: options.resize.fit || 'cover',
        withoutEnlargement: options.resize.withoutEnlargement ?? true,
      });
    }

    if (options.crop) {
      pipeline = pipeline.extract({
        left: options.crop.x,
        top: options.crop.y,
        width: options.crop.width,
        height: options.crop.height,
      });
    }

    const format = options.format || 'original';
    if (format !== 'original') {
      pipeline = pipeline.toFormat(format as any, { quality: options.quality || 80 });
    } else if (options.quality) {
      pipeline = pipeline.jpeg({ quality: options.quality });
    }

    if (options.blur && options.blur > 0) {
      pipeline = pipeline.blur(options.blur);
    }

    if (options.watermark) {
      const composite: any[] = [];
      if (options.watermark.text) {
        const svg = this.buildWatermarkOverlay(options.watermark.text, {
          position: options.watermark.position || 'center',
          opacity: options.watermark.opacity || 0.5,
        });
        composite.push({ input: Buffer.from(svg), top: 0, left: 0 });
      }
      if (options.watermark.image) {
        composite.push({ input: options.watermark.image, top: 0, left: 0 });
      }
      if (composite.length > 0) {
        pipeline = pipeline.composite(composite as any);
      }
    }

    const result = await pipeline.toBuffer();
    const metadata = await sharp(result).metadata();

    return { buffer: result, format: metadata.format || 'jpeg', width: metadata.width || 0, height: metadata.height || 0 };
  }

  async transform(_fileId: string, _options: TransformOptions): Promise<ImageTransformResult> {
    throw new Error('transform() requires file access — implement with FileService lookup');
  }

  async generateThumbnails(
    buffer: Buffer,
    _mimeType: string,
    specs: { suffix: string; width: number; height: number }[],
  ): Promise<{ spec: string; buffer: Buffer; width: number; height: number }[]> {
    const sharp = await this.getSharp();
    if (!sharp) return [];

    const results: { spec: string; buffer: Buffer; width: number; height: number }[] = [];

    for (const spec of specs) {
      try {
        const thumb = await sharp(buffer)
          .resize(spec.width, spec.height, { fit: 'cover', withoutEnlargement: true })
          .jpeg({ quality: 70 })
          .toBuffer();

        const meta = await sharp(thumb).metadata();
        results.push({
          spec: spec.suffix,
          buffer: thumb,
          width: meta.width || 0,
          height: meta.height || 0,
        });
      } catch (err) {
        this.logger.warn(`Thumbnail generation failed for ${spec.suffix}: ${(err as Error).message}`);
      }
    }

    return results;
  }

  private buildWatermarkOverlay(text: string, options: { position: string; opacity: number }): string {
    const positions: Record<string, string> = {
      'top-left': '10,10',
      'top-right': 'width-10,10',
      'bottom-left': '10,height-10',
      'bottom-right': 'width-10,height-10',
      center: 'width/2,height/2',
    };

    return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <text x="${positions[options.position] || 'center'}" y="${positions[options.position]?.split(',')[1] || 'center'}"
            font-family="Arial" font-size="24" fill="rgba(255,255,255,${options.opacity})"
            text-anchor="middle" alignment-baseline="middle">${this.escapeXml(text)}</text>
    </svg>`;
  }

  private escapeXml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}