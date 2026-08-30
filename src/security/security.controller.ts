import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RequireRoles } from 'src/rbac/decorators/role.decorator';
import { USER_ROLES } from 'src/utils/constants';
import { AssignSecurityDto } from './dto/assign-security.dto';
import { CreateAccessCodeDto } from './dto/create-access-code.dto';
import { LoginSecurityDto } from './dto/login-security.dto';
import { RegisterSecurityDto } from './dto/register-security.dto';
import { UseAccessCodeDto } from './dto/use-access-code.dto';
import { SecurityService } from './security.service';

@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('register')
  async register(@Body() dto: RegisterSecurityDto) {
    return this.securityService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginSecurityDto) {
    return this.securityService.login(dto.phoneNumber, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.LANDLORD, USER_ROLES.PROPERTY_MANAGER)
  @Post('property/:propertyId')
  async assign(
    @Param('propertyId') propertyId: string,
    @Body() dto: AssignSecurityDto,
    @Req() request: Request & { user: { id: string } },
  ) {
    return this.securityService.assign(
      propertyId,
      dto.securityId,
      request.user.id,
    );
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
    return { success: true, message: 'Security removed from property' };
  }

  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.LANDLORD, USER_ROLES.PROPERTY_MANAGER)
  @Get('property/:propertyId')
  async listSecurity(
    @Param('propertyId') propertyId: string,
    @Req() request: Request & { user: { id: string } },
  ) {
    return this.securityService.listSecurity(propertyId, request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.TENANT)
  @Post('unit/:unitId/access-code')
  async generateCode(
    @Param('unitId') unitId: string,
    @Body() dto: CreateAccessCodeDto,
    @Req() request: Request & { user: { id: string } },
  ) {
    return this.securityService.generateCode(unitId, request.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.SECURITY)
  @Get('property/:propertyId/access-codes')
  async getCodes(
    @Param('propertyId') propertyId: string,
    @Req() request: Request & { user: { id: string } },
  ) {
    return this.securityService.getCodes(propertyId, request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.SECURITY)
  @Post('property/:propertyId/access-codes/use')
  async useCode(
    @Param('propertyId') propertyId: string,
    @Body() dto: UseAccessCodeDto,
    @Req() request: Request & { user: { id: string } },
  ) {
    return this.securityService.useCode(propertyId, dto, request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @RequireRoles(USER_ROLES.LANDLORD, USER_ROLES.PROPERTY_MANAGER)
  @Get('property/:propertyId/access-code-logs')
  async getUsageLogs(
    @Param('propertyId') propertyId: string,
    @Req() request: Request & { user: { id: string } },
  ) {
    return this.securityService.getUsageLogs(propertyId, request.user.id);
  }
}
