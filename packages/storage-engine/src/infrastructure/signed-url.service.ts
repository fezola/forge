import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type {
  SignedUrlRequest, SignedUrlResult,
} from '@forge/storage-types';
import type { ISignedUrlService } from '../domain/storage-interfaces';
import type { IStorageProvider } from '@forge/storage-types';

@Injectable()
export class SignedUrlService implements ISignedUrlService {

  async generate(
    request: SignedUrlRequest,
    provider: IStorageProvider,
    bucketId: string,
    storagePath: string,
  ): Promise<SignedUrlResult> {
    const expiresIn = request.expiresInSeconds || 3600;

    if (provider.features.signedUrls) {
      const url = await provider.generateSignedUrl(bucketId, storagePath, request.action, expiresIn);
      return {
        url,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        fileId: request.fileId,
        action: request.action,
        method: request.method || 'GET',
      };
    }

    const token = uuid();
    const result: SignedUrlResult = {
      url: `/api/storage/signed/${token}`,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      fileId: request.fileId,
      action: request.action,
      method: request.method || 'GET',
    };

    return result;
  }

  async validate(url: string, _expectedAction: string): Promise<{ valid: boolean; fileId?: string; reason?: string }> {
    const token = url.split('/').pop();
    if (!token || token.length < 10) {
      return { valid: false, reason: 'Invalid token format' };
    }
    return { valid: true, fileId: token };
  }
}