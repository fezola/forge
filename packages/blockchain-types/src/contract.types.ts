export interface Contract {
  id: string;
  chainId: string;
  projectId: string;
  address: string;
  name: string;
  type: ContractType;
  abi?: Record<string, unknown> | null;
  verified: boolean;
  verifierUrl?: string | null;
  deployTxHash?: string | null;
  deployedBy?: string | null;
  deployedAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type ContractType = 'erc20' | 'erc721' | 'erc1155' | 'custom' | 'token' | 'nft' | 'defi' | 'dao' | 'wallet';

export interface DeployContractRequest {
  chainId: string;
  projectId: string;
  name: string;
  type: ContractType;
  bytecode: string;
  abi: Record<string, unknown>;
  constructorArgs?: unknown[];
  metadata?: Record<string, unknown>;
}

export interface ContractVerificationRequest {
  contractId: string;
  sourceCode: string;
  compilerVersion: string;
  optimizationUsed?: boolean;
  constructorArgs?: string;
}
