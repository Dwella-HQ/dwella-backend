import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RequireRoles } from 'src/rbac/decorators/role.decorator';
import { USER_ROLES } from 'src/utils/constants';
import { CreateAccessCodeDto } from './dto/create-access-code.dto';
import { LoginSecurityDto } from './dto/login-security.dto';
import { RegisterSecurityDto } from './dto/register-security.dto';
import { UseAccessCodeDto } from './dto/use-access-code.dto';
import { SecurityService } from './security.service';

@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('login')
  async login(@Body() dto: LoginSecurityDto) {
    const data = await this.securityService.login(
      dto.phoneNumber,
      dto.password,
    );
    return {
      success: true,
      message: 'Security logged in successfully',
      data,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.SECURITY)
  async getMySecurity(@Req() request: Request & { user: { id: string } }) {
    const data = await this.securityService.getSecurityByUserId(
      request.user.id,
    );
    return {
      success: true,
      message: 'Security retrieved successfully',
      data,
    };
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.LANDLORD, USER_ROLES.PROPERTY_MANAGER)
  async getSecurityByUserId(@Param('userId') userId: string) {
    const data = await this.securityService.getSecurityByUserId(userId);
    return {
      success: true,
      message: 'Security retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.LANDLORD, USER_ROLES.PROPERTY_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @Post('property/:propertyId/register')
  async registerAndAssign(
    @Param('propertyId') propertyId: string,
    @Body() dto: RegisterSecurityDto,
    @Req() request: Request & { user: { id: string } },
  ) {
    const data = await this.securityService.registerAndAssign(
      propertyId,
      dto,
      request.user.id,
    );
    return {
      success: true,
      message: 'Security registered and assigned to property successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.LANDLORD, USER_ROLES.PROPERTY_MANAGER)
  @Delete('property/:propertyId/:securityId')
  async remove(
    @Param('propertyId') propertyId: string,
    @Param('securityId') securityId: string,
    @Req() request: Request & { user: { id: string } },
  ) {
    await this.securityService.remove(propertyId, securityId, request.user.id);
    return {
      success: true,
      message: 'Security removed from property',
      data: null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.LANDLORD, USER_ROLES.PROPERTY_MANAGER)
  @Get('property/:propertyId')
  async listSecurity(
    @Param('propertyId') propertyId: string,
    @Req() request: Request & { user: { id: string } },
  ) {
    const data = await this.securityService.listSecurity(
      propertyId,
      request.user.id,
    );
    return {
      success: true,
      message: 'Security retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.TENANT)
  @Post('unit/:unitId/access-code')
  async generateCode(
    @Param('unitId') unitId: string,
    @Body() dto: CreateAccessCodeDto,
    @Req() request: Request & { user: { id: string } },
  ) {
    const data = await this.securityService.generateCode(
      unitId,
      request.user.id,
      dto,
    );
    return {
      success: true,
      message: 'Access code generated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.SECURITY)
  @Get('property/:propertyId/access-codes')
  async getCodes(
    @Param('propertyId') propertyId: string,
    @Req() request: Request & { user: { id: string } },
  ) {
    const data = await this.securityService.getCodes(
      propertyId,
      request.user.id,
    );
    return {
      success: true,
      message: 'Access codes retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.SECURITY)
  @Post('property/:propertyId/access-codes/use')
  async useCode(
    @Param('propertyId') propertyId: string,
    @Body() dto: UseAccessCodeDto,
    @Req() request: Request & { user: { id: string } },
  ) {
    const data = await this.securityService.useCode(
      propertyId,
      dto,
      request.user.id,
    );
    return {
      success: true,
      message: 'Access code used successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.LANDLORD, USER_ROLES.PROPERTY_MANAGER)
  @Get('property/:propertyId/access-code-logs')
  async getUsageLogs(
    @Param('propertyId') propertyId: string,
    @Req() request: Request & { user: { id: string } },
  ) {
    const data = await this.securityService.getUsageLogs(
      propertyId,
      request.user.id,
    );
    return {
      success: true,
      message: 'Access code logs retrieved successfully',
      data,
    };
  }
}
