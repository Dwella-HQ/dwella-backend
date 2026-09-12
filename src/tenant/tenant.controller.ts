import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { PropertyAccessGuard } from 'src/property-access/property-access.guard';
import { PropertyScope } from 'src/property-access/property-scope.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { QueryPaginationDto } from 'src/utils/query-pagination.dto';
import { InviteTenantDto } from './dto/invite-tenant.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/env.config';
import { QueryInviteDto } from './dto/query-invite.dto';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, PropertyAccessGuard)
@ApiBearerAuth()
@Controller('tenant')
export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  @Post()
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.tenantService.create(createTenantDto, user);
    return {
      success: true,
      message: 'Tenant created successfully',
      data,
    };
  }

  @Get()
  async findAll(
    @Query() queryPaginationDto: QueryPaginationDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.tenantService.findAll(queryPaginationDto, user);
    return {
      success: true,
      message: 'Tenants retrieved successfully',
      data,
    };
  }

  @PropertyScope({ param: 'id', type: 'tenant' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.tenantService.findOne(id);
    return {
      success: true,
      message: 'Tenant retrieved successfully',
      data,
    };
  }

  @Get('user/:userId')
  async getTenantByUserId(
    @Param('userId') userId: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.tenantService.getTenantByUserId(userId, user);
    return {
      success: true,
      message: 'Tenant retrieved successfully',
      data,
    };
  }

  @PropertyScope({ param: 'unitId', type: 'unit' })
  @Get('unit/:unitId')
  async findTenantsByUnitId(@Param('unitId') unitId: string) {
    const data = await this.tenantService.findTenantsByUnitId(unitId);
    return {
      success: true,
      message: 'Tenants retrieved successfully',
      data,
    };
  }

  @PropertyScope()
  @Get('property/:propertyId')
  async findTenantsByPropertyId(@Param('propertyId') propertyId: string) {
    const data = await this.tenantService.findTenantsByPropertyId(propertyId);
    return {
      success: true,
      message: 'Tenants retrieved successfully',
      data,
    };
  }

  @PropertyScope({ param: 'landlordId', type: 'landlord' })
  @Get('landlord/:landlordId')
  async findTenantsByLandlordId(@Param('landlordId') landlordId: string) {
    const data = await this.tenantService.findTenantsByLandlordId(landlordId);
    return {
      success: true,
      message: 'Tenants retrieved successfully',
      data,
    };
  }

  @PropertyScope({ param: 'id', type: 'tenant' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    const data = await this.tenantService.update(id, updateTenantDto);
    return {
      success: true,
      message: 'Tenant updated successfully',
      data,
    };
  }

  @PropertyScope({ param: 'id', type: 'tenant' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tenantService.remove(id);
    return {
      success: true,
      message: 'Tenant removed successfully',
    };
  }

  @Post('invite')
  async inviteTenant(
    @Body() inviteTenantDto: InviteTenantDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.tenantService.inviteTenant(inviteTenantDto, user);
    return {
      success: true,
      message: 'Tenant invited successfully',
      data,
    };
  }

  @Get('invite/query')
  async queryInvites(
    @Query() query: QueryInviteDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.tenantService.queryInvites(query, user);
    return {
      success: true,
      message: 'Invites retrieved successfully',
      data,
    };
  }

  @Public()
  @Get('invite/accept-invite')
  async acceptInvite(@Query('token') token: string, @Res() res: Response) {
    const redirectUrl = await this.tenantService.acceptInvite(token);
    res.redirect(redirectUrl);
  }

  @Public()
  @Get('invite/reject-invite')
  async rejectInvite(@Query('token') token: string, @Res() res: Response) {
    await this.tenantService.rejectInvite(token);
    return res.redirect(
      `${this.configService.get('FRONTEND_URL')}/invite-rejected`,
    );
  }
}
