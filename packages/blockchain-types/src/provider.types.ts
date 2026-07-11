export interface BlockchainProviderInterface {
  getBalance(address: string, chainSlug: string): Promise<string>;
  getTransaction(hash: string, chainSlug: string): Promise<Transaction | null>;
  sendTransaction(data: { from: string; to: string; value?: string; data?: string; gasLimit?: string; gasPrice?: string; chainSlug: string }): Promise<string>;
  estimateGas(data: { from: string; to: string; value?: string; data?: string; chainSlug: string }): Promise<string>;
  getBlockNumber(chainSlug: string): Promise<number>;
  verifyMessage(message: string, signature: string, address: string): Promise<boolean>;
  call(data: { to: string; data: string; chainSlug: string }): Promise<string>;
}

export interface ChainProviderConfig {
  rpcUrl: string;
  wsUrl?: string;
  apiKey?: string;
  network: string;
  chainId: number;
}
