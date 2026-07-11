import { BindingClient } from './binding-client';
import { QueryClient } from './query-client';
import { ExpressionClient } from './expression-client';
import { RealtimeClient } from './realtime-client';

export interface ReactiveClientConfig {
  baseUrl: string;
  wsUrl?: string;
  token?: string;
  projectId: string;
}

export class ReactiveClient {
  public bindings: BindingClient;
  public queries: QueryClient;
  public expressions: ExpressionClient;
  public realtime: RealtimeClient;
  public config: ReactiveClientConfig;

  constructor(config: ReactiveClientConfig) {
    this.config = config;
    this.bindings = new BindingClient(config);
    this.queries = new QueryClient(config);
    this.expressions = new ExpressionClient(config);
    this.realtime = new RealtimeClient(config);

    if (typeof window !== 'undefined') {
      this.realtime.connect();
    }
  }

  setToken(token: string): void {
    this.config.token = token;
  }

  destroy(): void {
    this.realtime.disconnect();
  }
}
