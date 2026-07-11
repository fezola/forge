import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/runtime', cors: { origin: '*' } })
export class ConnectorRuntimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[RuntimeWS] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[RuntimeWS] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('execute')
  async handleExecute(client: Socket, payload: { installationId: string; actionId: string; input: Record<string, unknown>; projectId: string }) {
    // Forward to runtime service and emit result
    client.emit('result', { status: 'processing', requestId: payload.installationId });
  }

  @SubscribeMessage('subscribe:trigger')
  handleSubscribeTrigger(client: Socket, payload: { installationId: string; triggerId: string }) {
    client.join(`trigger:${payload.installationId}:${payload.triggerId}`);
  }

  emitEvent(event: string, data: unknown) {
    this.server.emit(event, data);
  }
}
