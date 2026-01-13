import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/guards/loginGuard.guard';
import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Req,
  Res,
  Param,
  Get,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
// import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { FacebookLoginDto } from './dto/facebook-login.dto';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import { User } from 'src/user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  @Post('register')
  async create(@Body() registerDto: RegisterDto) {
    const data = await this.authService.register(registerDto);
    return {
      sucess: true,
      message:
        'Registration successful. Please check your email to verify your account.',
      data,
    };
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async loginUser(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() loginDto: LoginDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = (request as any).user as User;
    const tokens = await this.authService.getTokens(user.id, user.email);
    res.cookie('x-refresh-token', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production', // only over HTTPS
      sameSite: 'none',
      path: '/',
    });
    return {
      success: true,
      message: 'user logged in successfully',
      data: {
        accessToken: tokens.accessToken,
        user,
      },
    };
  }

  @Post('google-login')
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    const user = await this.authService.googleLogin(googleLoginDto);
    const tokens = await this.authService.getTokens(user.id, user.email);
    return {
      success: true,
      message: 'Google login successful',
      data: {
        user,
        accessToken: tokens.accessToken,
      },
    };
  }

  @Post('facebook-login')
  async facebookLogin(@Body() facebookLoginDto: FacebookLoginDto) {
    const user = await this.authService.facebookLogin(facebookLoginDto);
    const tokens = await this.authService.getTokens(user.id, user.email);
    return {
      success: true,
      message: 'Facebook login successful',
      data: {
        user,
        accessToken: tokens.accessToken,
      },
    };
  }

  @Get('verify-email-token')
  async resendVerificationEmail(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email query parameter is required');
    }
    const user = await this.authService.resendVerificationEmail(email);
    return {
      success: true,
      message: 'Verification email sent successfully',
      data: user,
    };
  }

  @Get('verify-email')
  async verifyEmail(
    @Query() verifyEmailDto: VerifyEmailDto,
    @Res() res: Response,
  ) {
    try {
      await this.authService.verifyEmail(verifyEmailDto.token);
      res.redirect(
        `${this.configService.get('FRONTEND_URL')}/auth/verify-email?verified=true&email=${verifyEmailDto.email}`,
      );
    } catch (error) {
      res.redirect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        `${this.configService.get('FRONTEND_URL')}/auth/verify-email?verified=false&email=${verifyEmailDto.email}&reason=${encodeURIComponent(error?.message || 'Unknown error')}`,
      );
    }
  }

  @Get('forgot-password')
  async generateForgotPasswordToken(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email query parameter is required');
    }
    const user = await this.authService.generateForgotPasswordToken(email);
    return {
      success: true,
      message: 'Forgot password token generated and sent to email',
      data: user,
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() changePasswordDto: ChangePasswordDto) {
    const user = await this.authService.resetPassword(changePasswordDto);
    return {
      success: true,
      message: 'Password reset successfully',
      data: user,
    };
  }

  @Get('refresh-token')
  async refreshTokens(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = request.headers['x-refresh-token'] as string;
    const newTokens = await this.authService.refreshTokens(token);
    res.setHeader('x-refresh-token', newTokens.refreshToken);
    return {
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        accessToken: newTokens.accessToken,
      },
    };
  }

  @Delete('logout/:userId')
  async logoutUser(@Param('userId') userId: string, @Req() request: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const token = request.cookies['x-refresh-token'] as string;
    await this.authService.logout(userId, token || '');
    return {
      success: true,
      message: 'User logged out successfully',
    };
  }
}
