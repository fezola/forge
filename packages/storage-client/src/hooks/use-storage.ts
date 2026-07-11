import { useState, useEffect, useCallback } from 'react';
import { StorageClient, StorageClientConfig } from '../storage-client';
import type {
  BucketDefinition, FileListResult, UploadResult,
} from '@forge/storage-types';

interface UseStorageResult {
  buckets: BucketDefinition[];
  files: FileListResult | null;
  currentBucket: BucketDefinition | null;
  loading: boolean;
  error: string | null;
  listBuckets: () => Promise<void>;
  listFiles: (bucketId: string, options?: { folder?: string; offset?: number; limit?: number }) => Promise<void>;
  selectBucket: (bucket: BucketDefinition) => void;
  uploadFile: (bucketId: string, file: File, folder?: string) => Promise<UploadResult | null>;
  deleteFile: (fileId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useStorage(config: StorageClientConfig): UseStorageResult {
  const client = new StorageClient(config);
  const [buckets, setBuckets] = useState<BucketDefinition[]>([]);
  const [files, setFiles] = useState<FileListResult | null>(null);
  const [currentBucket, setCurrentBucket] = useState<BucketDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listBuckets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.listBuckets();
      setBuckets(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const listFiles = useCallback(async (bucketId: string, options?: { folder?: string; offset?: number; limit?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.listFiles(bucketId, options);
      setFiles(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const selectBucket = useCallback((bucket: BucketDefinition) => {
    setCurrentBucket(bucket);
  }, []);

  const uploadFile = useCallback(async (bucketId: string, file: File, folder?: string): Promise<UploadResult | null> => {
    setError(null);
    try {
      const result = await client.uploadFile(bucketId, file, { folder });
      await listFiles(bucketId);
      return result;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, [client, listFiles]);

  const deleteFile = useCallback(async (fileId: string) => {
    setError(null);
    try {
      await client.deleteFile(fileId);
      if (currentBucket) {
        await listFiles(currentBucket.id);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [client, currentBucket, listFiles]);

  const refresh = useCallback(async () => {
    await listBuckets();
    if (currentBucket) {
      await listFiles(currentBucket.id);
    }
  }, [listBuckets, listFiles, currentBucket]);

  useEffect(() => {
    listBuckets();
  }, [listBuckets]);

  return {
    buckets, files, currentBucket, loading, error,
    listBuckets, listFiles, selectBucket, uploadFile, deleteFile, refresh,
  };
}