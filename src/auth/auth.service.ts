import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegistrationTypeEnum } from 'src/utils/constants';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { generateRandomString } from 'src/utils/misc';
import { JwtService } from '@nestjs/jwt';
import { GoogleAuthService } from 'src/services/google/google-auth.service';
import { FacebookAuthService } from 'src/services/facebook/facebook.auth.service';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import { Cache } from 'cache-manager';
import ms from 'ms';
import { GoogleLoginDto } from './dto/google-login.dto';
import { FacebookLoginDto } from './dto/facebook-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private googleAuthService: GoogleAuthService,
    private facebookAuthService: FacebookAuthService,
    private configService: ConfigService<EnvironmentVariables>,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);
    return user;
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userService.findOneByEmail(email);
    return await this.userService.sendVerifyEmail(user);
  }

  async verifyEmail(token: string) {
    const user = await this.userService.verifyEmail(token);
    return user;
  }

  async generateForgotPasswordToken(email: string) {
    const user = await this.userService.generateForgotPasswordToken(email);
    return user;
  }

  async resetPassword(changePasswordDto: ChangePasswordDto) {
    const user = await this.userService.changePassword(
      changePasswordDto.token,
      changePasswordDto.password,
    );
    return user;
  }

  async getTokens(userId: string, email: string) {
    const tokenId = generateRandomString();
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          tokenId,
        },
        {
          secret: this.configService.get('JWT_SECRET_KEY'),
          expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          tokenId,
        },
        {
          secret: this.configService.get('JWT_SECRET_KEY'),
          expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'),
        },
      ),
    ]);
    const cacheKey = `tokens:${userId}`;
    // const cacheValue = (await this.cacheManager.get<string[]>(cacheKey)) || [];
    const newCacheValue = [tokenId];
    await this.cacheManager.set(
      cacheKey,
      newCacheValue,
      ms(
        this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION',
        ) as ms.StringValue,
      ),
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(token: string) {
    const decoded = this.jwtService.decode<{
      sub: string;
      tokenId: string;
      email: string;
    }>(token);
    if (!decoded || !decoded.sub || !decoded.tokenId || !decoded.email) {
      throw new BadRequestException('Invalid token');
    }
    const userId = decoded.sub;
    const cacheKey = `tokens:${userId}`;
    const cacheValue = (await this.cacheManager.get<string[]>(cacheKey)) || [];
    if (!cacheValue.includes(decoded.tokenId)) {
      throw new BadRequestException('Invalid token');
    }
    const user = await this.getUser(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.getTokens(userId, decoded.email);
  }

  async googleLogin(googleLoginDto: GoogleLoginDto) {
    const payload = await this.googleAuthService.verifyToken(
      googleLoginDto.token,
    );
    if (!payload || !payload.email) {
      throw new BadRequestException('Invalid Google token');
    }
    const user = await this.userService.create({
      email: payload.email,
      fullName: payload.name!,
      password: generateRandomString(20),
      roleName: googleLoginDto.roleName,
      registrationType: RegistrationTypeEnum.GOOGLE,
    });
    return user;
  }

  async facebookLogin(facebookLoginDto: FacebookLoginDto) {
    const data = await this.facebookAuthService.verifyToken(
      facebookLoginDto.token,
    );
    if (!data || !data.email) {
      throw new BadRequestException('Invalid Facebook token');
    }
    const user = await this.userService.create({
      email: data.email,
      fullName: data.name,
      password: generateRandomString(20),
      roleName: facebookLoginDto.roleName,
      registrationType: RegistrationTypeEnum.FACEBOOK,
    });
    return user;
  }

  async getUser(userId: string) {
    const user = await this.userService.findOne(userId);
    return user;
  }

  async getAuthenticatedUser(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if (user.registrationType !== RegistrationTypeEnum.EMAIL) {
      throw new BadRequestException(`Wrong Registration type`);
    }
    const result = await user.comparePasswords(password);
    if (!result) {
      throw new BadRequestException('Wrong details provided');
    }
    return user;
  }

  async logout(userId: string, token: string) {
    const decoded = this.jwtService.decode<{ sub: string; tokenId: string }>(
      token,
    );
    if (!decoded || !decoded.sub || !decoded.tokenId) {
      throw new BadRequestException('Invalid token');
    }
    if (decoded.sub !== userId) {
      throw new BadRequestException('Invalid token for user');
    }
    const tokenId = decoded.tokenId;
    const cacheKey = `tokens:${userId}`;
    const cacheValue = (await this.cacheManager.get<string[]>(cacheKey)) || [];
    const newCacheValue = cacheValue.filter((id) => id !== tokenId);
    await this.cacheManager.set(
      cacheKey,
      newCacheValue,
      ms(
        this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION',
        ) as ms.StringValue,
      ),
    );
  }
}
