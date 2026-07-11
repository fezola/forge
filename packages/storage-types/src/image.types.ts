export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'svg' | 'heic';

export interface ImageInfo {
  width: number;
  height: number;
  format: ImageFormat;
  orientation?: number;
  channels?: number;
  hasAlpha?: boolean;
  hasProfile?: boolean;
  space?: string;
  density?: number;
  exif?: Record<string, unknown>;
}

export interface TransformOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: 'center' | 'top' | 'right' | 'bottom' | 'left' | 'entropy' | 'attention';
  background?: string;
  withoutEnlargement?: boolean;
  format?: ImageFormat;
  quality?: number;
  compressionLevel?: number;
  lossless?: boolean;
  nearLossless?: boolean;
  blur?: number;
  sharpen?: number | { sigma: number; m1?: number; m2?: number; x1?: number; y2?: number; y3?: number };
  gamma?: number;
  negate?: boolean;
  normalize?: boolean;
  threshold?: number;
  tint?: string;
  grayscale?: boolean;
  hue?: number;
  saturation?: number;
  brightness?: number;
  watermark?: {
    image?: Buffer;
    text?: string;
    position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile';
    opacity?: number;
    scale?: number;
  };
  backgroundRemoval?: boolean;
}

export interface OptimizedOutput {
  buffer: Buffer;
  format: ImageFormat;
  width: number;
  height: number;
  sizeBytes: number;
  originalSizeBytes: number;
  savingsPercent: number;
}

export interface ImageTransformResult {
  variants: {
    spec: string;
    url: string;
    width: number;
    height: number;
    format: ImageFormat;
    sizeBytes: number;
  }[];
  metadata: ImageInfo;
}

export type ImageProcessingStep = 'resize' | 'crop' | 'format' | 'quality' | 'blur' | 'sharpen' | 'watermark' | 'thumbnail' | 'background_removal' | 'auto_orient' | 'normalize' | 'grayscale' | 'tint' | 'rotate';