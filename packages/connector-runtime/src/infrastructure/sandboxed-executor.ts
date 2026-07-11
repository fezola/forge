import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IActionExecutor } from '../domain/action-executor.interface';
import { ConnectorContext, ConnectorExecutionResult } from '@forge/connector-sdk';
import { ConnectorManifestDTO } from '@forge/types';

@Injectable()
export class SandboxedExecutor implements IActionExecutor {
  constructor(private readonly httpService: HttpService) {}

  async execute(
    manifest: ConnectorManifestDTO,
    context: ConnectorContext,
  ): Promise<ConnectorExecutionResult> {
    const start = Date.now();

    // Permission check: deny all network access by default
    if (!this.hasNetworkPermission(context)) {
      return {
        success: false,
        statusCode: 403,
        data: null,
        duration: Date.now() - start,
        error: 'PERMISSION_DENIED: Connector does not have network access',
      };
    }

    try {
      const action = manifest as any;
      const response = await firstValueFrom(
        this.httpService.request({
          url: '', // caller must set the actual URL
          method: 'POST',
          data: context.input,
          headers: {
            'Content-Type': 'application/json',
            ...(context.secrets?.Authorization ? { Authorization: context.secrets.Authorization } : {}),
          },
          timeout: 30000,
        }),
      );

      return {
        success: true,
        statusCode: response.status,
        data: response.data,
        duration: Date.now() - start,
      };
    } catch (error: any) {
      return {
        success: false,
        statusCode: error?.response?.status || 500,
        data: error?.response?.data || error.message,
        duration: Date.now() - start,
        error: error?.message || 'Unknown error',
      };
    }
  }

  private hasNetworkPermission(context: ConnectorContext): boolean {
    if (!context.permissions?.permissions) return false;
    return context.permissions.permissions.some(
      p => p.scope === 'network' && p.actions.includes('read'),
    );
  }
}
