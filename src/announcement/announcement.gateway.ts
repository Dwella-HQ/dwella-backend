/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';
import { WsAuthGuard } from 'src/auth/guards/ws.guard';
import { AnnouncementService } from './announcement.service';
import { JwtPayload } from 'src/auth/strategy/jwt.strategy';
import { Cache } from '@nestjs/cache-manager';

@UseGuards(WsAuthGuard) // Use global WS guard for authentication
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'announcements',
  transports: ['websocket'],
})
export class AnnouncementGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger(AnnouncementGateway.name);
  private rooms = new Set<string>();

  constructor(
    private readonly announcementService: AnnouncementService,
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
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
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
    console.log((client as any).data.user);
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
}
