/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AppNotificationService } from './app.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { Inject, Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Cache } from 'cache-manager';
import { AppNotification } from './entities/app.entity';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { WsAuthGuard } from 'src/auth/guards/ws.guard';

@UseGuards(WsAuthGuard) // Use global WS guard for authentication
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
  transports: ['websocket'],
})
export class AppNotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger(AppNotificationGateway.name);
  private rooms = new Set<string>();

  constructor(
    private readonly appNotificationService: AppNotificationService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.query.token as string) ||
      (client.handshake.auth.token as string);
    if (!token) {
      client.emit('error', { message: 'Authentication failed: Token missing' });
      client.disconnect(); // ❌ reject connection
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const { sub, tokenId } = payload as { sub: string; tokenId: string };
      const cachedTokens =
        (await this.cacheManager.get<string[]>(`tokens:${sub}`)) || [];
      if (!cachedTokens.includes(tokenId)) {
        throw new Error('Invalid token');
      }
      const user = await this.authService.getUser(sub);
      await client.join(`user:${sub}`);
      if (!user) {
        throw new Error('Invalid token');
      }
      (client as any).data.user = user;
    } catch {
      client.emit('error', { message: 'Authentication failed: Invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log((client as any).user);
    // cleanup if needed
  }

  joinRoom(userId: string) {
    if (!this.server) {
      this.logger.warn('Socket server not bound yet');
      return;
    }
    if (this.rooms.has(userId)) {
      return; // already joined
    }
    this.server.socketsJoin(`user:${userId}`);
    this.rooms.add(userId);
  }

  emitToUser(userId: string, notifications: AppNotification[]) {
    if (!this.server) {
      this.logger.warn('Socket server not bound yet');
      return;
    }
    this.server
      .to(`user:${userId}`)
      .emit('notifications:load', notifications || []);
  }

  @SubscribeMessage('notification:load')
  loadNotifications(
    @MessageBody() data: GetNotificationsDto,
    // @ConnectedSocket() client: Socket,
  ) {
    console.log('Load Notifications', { data });
    void this.appNotificationService.getUserNotification(data);
  }

  @SubscribeMessage('notification:read')
  readNotifications(
    @MessageBody() data: { notificationId: string; userId: string },
  ) {
    void this.appNotificationService.readNotication(
      data.userId,
      data.notificationId,
    );
  }

  @SubscribeMessage('notification:delete')
  deleteNotifications(
    @MessageBody() data: { notificationId: string; userId: string },
  ) {
    void this.appNotificationService.deleteNotification(
      data.userId,
      data.notificationId,
    );
  }
}
