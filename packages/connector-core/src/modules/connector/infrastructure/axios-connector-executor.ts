import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IConnectorExecutor } from '../domain/connector-executor.interface';
import { ConnectorExecutionResult } from '@forge/types';

@Injectable()
export class AxiosConnectorExecutor implements IConnectorExecutor {
  constructor(private readonly httpService: HttpService) {}

  async execute(
    connector: { type: string; config: Record<string, unknown> },
    payload?: unknown,
  ): Promise<ConnectorExecutionResult> {
    const start = Date.now();
    try {
      const { url, method = 'GET', headers = {} } = connector.config as any;

      if (connector.type === 'rest') {
        const response = await firstValueFrom(
          this.httpService.request({
            url,
            method: method as string,
            headers: headers as Record<string, string>,
            data: payload,
          }),
        );

        return {
          success: true,
          statusCode: response.status,
          data: response.data,
          duration: Date.now() - start,
        };
      }

      return {
        success: false,
        statusCode: 400,
        data: null,
        duration: Date.now() - start,
      };
    } catch (error: any) {
      return {
        success: false,
        statusCode: error?.response?.status || 500,
        data: error?.response?.data || error.message,
        duration: Date.now() - start,
      };
    }
  }

  async test(connector: { type: string; config: Record<string, unknown> }): Promise<boolean> {
    try {
      const result = await this.execute(connector);
      return result.success;
    } catch {
      return false;
    }
  }
}
