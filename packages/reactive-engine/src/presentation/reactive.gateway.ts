import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SubscriptionManagerService } from '../application/subscription-manager.service';

@WebSocketGateway({ namespace: '/reactive', cors: { origin: '*' } })
export class ReactiveGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly subscriptions: SubscriptionManagerService) {}

  handleConnection(client: Socket) {
    console.log(`[ReactiveWS] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.subscriptions.unsubscribeAll(client.id);
    console.log(`[ReactiveWS] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(client: Socket, payload: { sourceId: string; bindingId?: string; filters?: Record<string, unknown> }) {
    const subId = await this.subscriptions.subscribe(client.id, payload.sourceId, payload.bindingId, payload.filters);
    client.join(`source:${payload.sourceId}`);
    client.emit('subscribed', { subscriptionId: subId, sourceId: payload.sourceId });
  }

  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(client: Socket, payload: { subscriptionId: string }) {
    await this.subscriptions.unsubscribe(payload.subscriptionId);
    client.emit('unsubscribed', { subscriptionId: payload.subscriptionId });
  }

  emitSourceUpdate(sourceId: string, data: unknown) {
    this.server.to(`source:${sourceId}`).emit('data', { sourceId, data, timestamp: new Date().toISOString() });
  }
}
