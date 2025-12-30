/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { EmailService } from 'src/notification/email/email.service';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import ms from 'ms';
import { RegistrationTypeEnum } from 'src/utils/constants';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly rbacService: RbacService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const role = await this.rbacService.getRoleByName(createUserDto.roleName);
      const user = this.userRepository.create(createUserDto);
      user.role = role;
      const savedUser = await queryRunner.manager.save(user);
      if ([RegistrationTypeEnum.EMAIL].includes(savedUser.registrationType)) {
        await this.sendVerifyEmail(savedUser);
      } else {
        savedUser.isEmailVerified = true;
        await queryRunner.manager.save(savedUser);
      }
      await queryRunner.commitTransaction();
      return user;
    } catch (error: any) {
      console.log(error);

      await queryRunner.rollbackTransaction();
      if (error?.code == '23505') {
        throw new BadRequestException(error.detail);
      }
      throw new InternalServerErrorException(error.detail);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async sendVerifyEmail(user: User) {
    const token = await this.cacheManager.get<string>(
      `email-verification-token-${user.id}`,
    );
    let verificationLink = '';
    if (token) {
      verificationLink = `${this.configService.get('BACKEND_URL')}/auth/verify-email?email=${user.email}&token=${token}`;
    } else {
      const payload = { sub: user.id, email: user.email };
      const newToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      });
      verificationLink = `${this.configService.get('BACKEND_URL')}/auth/verify-email?email=${user.email}&token=${newToken}`;
      await this.cacheManager.set(
        `email-verification-token-${user.id}`,
        newToken,
        ms(this.configService.get('JWT_EXPIRES_IN') as ms.StringValue),
      ); // 30 minutes

      await this.emailService.sendMailToUser({
        user,
        subject: 'Verify your email address',
        template: 'verify-email',
        context: {
          name: user.fullName,
          verificationLink,
          expirationTime: this.configService.get<string>('JWT_EXPIRES_IN'),
        },
      });

      return user;
    }
  }

  async verifyEmail(token: string) {
    const payload = await this.jwtService
      .verifyAsync<{ email: string; sub: string }>(token)
      .catch(() => {
        throw new BadRequestException('Invalid or expired token');
      });
    const user = await this.findOne(payload.sub);
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }
    user.isEmailVerified = true;
    return user.save();
  }

  async generateForgotPasswordToken(email: string) {
    const user = await this.findOneByEmail(email);
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload, {
      expiresIn: '30m',
    });
    const resetLink = `${this.configService.get(
      'FRONTEND_URL',
    )}/auth/reset-password?token=${encodeURIComponent(token)}`;
    await this.emailService.sendMailToUser({
      user,
      subject: 'Password Reset Request',
      template: 'reset-password',
      context: {
        fullName: user.fullName,
        resetLink,
        expirationTime: this.configService.get<string>('JWT_EXPIRES_IN'),
      },
    });
    return true;
  }

  async changePassword(token: string, password: string) {
    const payload = await this.jwtService
      .verifyAsync<{ email: string; sub: string }>(token)
      .catch(() => {
        throw new BadRequestException('Invalid or expired token');
      });
    const user = await this.findOne(payload.sub);
    user.password = password;
    await user.save();
    return user;
  }

  async findAll() {
    const users = await this.userRepository.find();
    return users;
  }

  async query(queryUserDto: QueryUserDto) {
    const {
      email,
      phoneNumber,
      isActive,
      isVerified,
      name,
      roleName,
      search,
      userId,
      page = 1,
      limit = 10,
    } = queryUserDto;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (email) {
      queryBuilder.andWhere('user.email = :email', { email });
    }
    if (phoneNumber) {
      queryBuilder.andWhere('user.phoneNumber = :phoneNumber', { phoneNumber });
    }
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }
    if (isVerified !== undefined) {
      queryBuilder.andWhere('user.isEmailVerified = :isVerified', {
        isVerified: isVerified === 'true',
      });
    }
    if (name) {
      queryBuilder.andWhere('user.fullName ILIKE :name', { name: `%${name}%` });
    }
    if (roleName) {
      queryBuilder
        .leftJoinAndSelect('user.role', 'role')
        .andWhere('role.name = :roleName', { roleName });
    }
    if (search) {
      queryBuilder.andWhere(
        '(user.fullName ILIKE :search OR user.email ILIKE :search OR user.phoneNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (userId) {
      queryBuilder.andWhere('user.id = :userId', { userId });
    }
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    for (const key in updateUserDto) {
      if (updateUserDto[key] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        user[key] = updateUserDto[key];
      }
    }
    return user.save();
  }

  async remove(id: string) {
    //TODO run the extra delete logic like removing related data in a background job
    const result = await this.userRepository.softDelete({ id });
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return true;
  }
}
