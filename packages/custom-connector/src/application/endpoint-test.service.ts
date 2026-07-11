import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AuthConfig } from '@forge/connector-sdk';

@Injectable()
export class EndpointTestService {
  constructor(private readonly httpService: HttpService) {}

  async testEndpoint(input: {
    baseUrl: string;
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: unknown;
    authConfig?: AuthConfig;
  }) {
    const start = Date.now();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(input.headers || {}),
    };

    if (input.authConfig) {
      this.applyAuthHeaders(headers, input.authConfig);
    }

    const url = `${input.baseUrl.replace(/\/+$/, '')}${input.path.startsWith('/') ? input.path : `/${input.path}`}`;

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          url,
          method: input.method as any,
          headers,
          data: input.body,
          timeout: 15000,
        }),
      );

      return {
        success: true,
        statusCode: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        duration: Date.now() - start,
      };
    } catch (error: any) {
      return {
        success: false,
        statusCode: error?.response?.status || 0,
        statusText: error?.code || 'ERROR',
        headers: error?.response?.headers || {},
        data: error?.response?.data || error.message,
        duration: Date.now() - start,
        error: error?.message,
      };
    }
  }

  private applyAuthHeaders(headers: Record<string, string>, auth: AuthConfig): void {
    switch (auth.method) {
      case 'BEARER_TOKEN':
        headers['Authorization'] = `Bearer ${auth.token}`;
        break;
      case 'API_KEY':
        if (auth.in === 'header') {
          headers[auth.key] = auth.value;
        }
        break;
      case 'BASIC_AUTH':
        headers['Authorization'] = `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`;
        break;
    }
  }
}
