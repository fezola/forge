export interface Web3AuthChallenge {
  id: string;
  address: string;
  chainSlug: string;
  message: string;
  signature?: string | null;
  nonce: string;
  expiresAt: string;
  completed: boolean;
  identityId?: string | null;
  createdAt: string;
}

export interface Web3LoginRequest {
  address: string;
  signature: string;
  message: string;
  chainSlug?: string;
}

export interface Web3AuthResult {
  token: string;
  identityId: string;
  address: string;
}
