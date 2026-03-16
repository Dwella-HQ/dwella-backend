/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Server } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { TenantService } from 'src/tenant/tenant.service';
import { PropertyManagerService } from 'src/property-manager/property-manager.service';
import { LandlordService } from 'src/landlord/landlord.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { LessThan, Repository } from 'typeorm';
import { ChatParticipant } from './entities/chat-participant.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { USER_ROLES } from 'src/utils/constants';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import ms from 'ms';
import { GetChatMessagesDto } from './dto/get-chat-messages.dto';

@Injectable()
export class ChatService {
  private server: Server;

  constructor(
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
    private readonly propertyManagerService: PropertyManagerService,
    private readonly landlordService: LandlordService,
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatParticipant)
    private readonly chatParticipantRepository: Repository<ChatParticipant>,
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  bindServer(server: Server) {
    this.server = server;
  }

  async getUserChatIds(roleId: string) {
    const cacheKey = `user:${roleId}:chatIds`;
    const cachedChatIds = await this.cacheManager.get<string[]>(cacheKey);
    if (cachedChatIds && cachedChatIds.length > 0) {
      return cachedChatIds;
    }
    const chatParticipants = await this.chatParticipantRepository.find({
      where: {
        roleId,
      },
      relations: {
        chat: true,
      },
    });
    const chatIds = chatParticipants.map((participant) => participant.chat.id);
    await this.cacheManager.set(cacheKey, chatIds, ms('1d') / 1000);
    return chatIds;
  }

  async create(createChatDto: CreateChatDto) {
    const chat = this.chatRepository.create({});
    const participants: ChatParticipant[] = [];
    for (const participantDto of createChatDto.participants) {
      let participant: ChatParticipant | undefined;
      if (participantDto.role === USER_ROLES.TENANT) {
        const tenant = await this.tenantService.findOne(participantDto.roleId);
        participant = this.chatParticipantRepository.create({
          user: tenant.user,
          role: participantDto.role,
          roleId: participantDto.roleId,
          chat,
        });
      }
      if (participantDto.role === USER_ROLES.PROPERTY_MANAGER) {
        const manager = await this.propertyManagerService.findOne(
          participantDto.roleId,
        );
        participant = this.chatParticipantRepository.create({
          user: manager.user,
          role: participantDto.role,
          roleId: participantDto.roleId,
          chat,
        });
      }
      if (participantDto.role === USER_ROLES.LANDLORD) {
        const landlord = await this.landlordService.findOne(
          participantDto.roleId,
        );
        participant = this.chatParticipantRepository.create({
          user: landlord.user,
          role: participantDto.role,
          roleId: participantDto.roleId,
          chat,
        });
      }
      if (!participant) {
        throw new BadRequestException(`Invalid participant`);
      }
      participants.push(participant);
    }
    chat.participants = participants;
    await this.chatRepository.save(chat);
    return chat;
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }

  async getChatMessages(getChatMessagesDto: GetChatMessagesDto) {
    const messages = await this.chatMessageRepository.find({
      where: {
        chat: {
          id: getChatMessagesDto.chatId,
          createdAt: getChatMessagesDto.cursor
            ? LessThan(getChatMessagesDto.cursor)
            : undefined,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      take: getChatMessagesDto.limit,
    });
    this.server
      .to(`chat:${getChatMessagesDto.chatId}`)
      .emit('load:messages', messages);
    return messages;
  }

  async dispatchMessages(chatId: string, cursor?: Date, limit = 50) {
    const messages = await this.getChatMessages({
      chatId,
      cursor,
      limit,
    });
    this.server.to(`chat:${chatId}`).emit('load:messages', messages);
  }
}
