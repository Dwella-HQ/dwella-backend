/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from '../auth.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token: string =
      (client.handshake.query.token as string) ||
      (client.handshake.auth.token as string);

    try {
      const user = await this.authService.verifyToken(token);
      client.data.user = user; // attach user to socket
      return true;
    } catch {
      client.emit('error', { message: 'Authentication failed: Invalid token' });
      client.disconnect();
      return false;
    }
  }
}
