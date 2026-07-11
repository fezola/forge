import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/workflows', cors: { origin: '*' } })
export class WorkflowGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[WorkflowWS] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WorkflowWS] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:workflow')
  handleSubscribe(client: Socket, workflowId: string) {
    client.join(`workflow:${workflowId}`);
  }

  @SubscribeMessage('subscribe:execution')
  handleSubscribeExecution(client: Socket, executionId: string) {
    client.join(`execution:${executionId}`);
  }

  @SubscribeMessage('execute')
  async handleExecute(client: Socket, payload: { workflowId: string; input?: Record<string, unknown> }) {
    client.emit('execution:started', { workflowId: payload.workflowId, status: 'pending' });
    // The actual execution happens via the controller; this just enables real-time notification
  }

  emitNodeResult(executionId: string, result: any) {
    this.server.to(`execution:${executionId}`).emit('node:completed', result);
  }

  emitExecutionComplete(executionId: string, result: any) {
    this.server.to(`execution:${executionId}`).emit('execution:completed', result);
  }

  emitExecutionError(executionId: string, error: any) {
    this.server.to(`execution:${executionId}`).emit('execution:failed', error);
  }
}
