export interface SignedUrlRequest {
  fileId: string;
  action: 'read' | 'write' | 'delete';
  expiresInSeconds?: number;
  ipRestriction?: string;
  userAgentRestriction?: string;
  maxDownloads?: number;
  method?: 'GET' | 'PUT' | 'POST' | 'DELETE';
}

export interface SignedUrlResult {
  url: string;
  expiresAt: string;
  fileId: string;
  action: string;
  method: string;
  remainingDownloads?: number;
}

export interface SignedUrlPolicy {
  maxValiditySeconds: number;
  allowedActions: ('read' | 'write' | 'delete')[];
  requireAuthentication?: boolean;
  allowPublicAccess?: boolean;
  defaultExpiresInSeconds: number;
}