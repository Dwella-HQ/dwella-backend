/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Inject, Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/auth/guards/ws.guard';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { JwtPayload } from 'src/auth/strategy/jwt.strategy';
import { Cache } from '@nestjs/cache-manager';
import { DeleteMessagesDto } from './dto/delete-messages.dto';
import { GetChatMessagesDto } from './dto/get-chat-messages.dto';
import { ReadMessagesDto } from './dto/read-messages.dto';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

@UseGuards(WsAuthGuard) // Use global WS guard for authentication
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  @WebSocketServer()
  server!: Server;

  afterInit() {
    this.chatService.bindServer(this.server);
  }

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
      // await this.chatService.joinRoom(client, user);
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

  @SubscribeMessage('chat')
  async joinChat(
    @MessageBody() roleId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const chats = await this.chatService.getUserChats(roleId);
    for (const chat of chats) {
      void client.join(chat.id);
    }
    return { message: `Joined ${chats.length} chat rooms` };
  }

  @SubscribeMessage('createChat')
  async create(@MessageBody() createChatDto: CreateChatDto) {
    return await this.chatService.create(createChatDto);
  }

  @SubscribeMessage('findOneChat')
  async findOne(@MessageBody() id: string) {
    return await this.chatService.findOne(id);
  }

  @SubscribeMessage('addChatMessage')
  async addChatMessage(
    @MessageBody() createChatMessageDto: CreateChatMessageDto,
  ) {
    return await this.chatService.addChatMessage(createChatMessageDto);
  }

  @SubscribeMessage('getChatMessages')
  async getMessages(@MessageBody() getChatMessagesDto: GetChatMessagesDto) {
    return await this.chatService.getChatMessages(getChatMessagesDto);
  }

  @SubscribeMessage('readChatMessages')
  async readMessages(@MessageBody() readMessagesDto: ReadMessagesDto) {
    return await this.chatService.readMessages(readMessagesDto);
  }

  @SubscribeMessage('deleteChatMessages')
  async deleteMessages(@MessageBody() deleteMessagesDto: DeleteMessagesDto) {
    return await this.chatService.deleteMessages(deleteMessagesDto);
  }

  @SubscribeMessage('removeChat')
  async remove(@MessageBody() id: string) {
    return await this.chatService.remove(id);
  }
}
