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
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { QueryPaginationDto } from 'src/utils/query-pagination.dto';
import { InviteTenantDto } from './dto/invite-tenant.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async create(@Body() createTenantDto: CreateTenantDto) {
    const data = await this.tenantService.create(createTenantDto);
    return {
      success: true,
      message: 'Tenant created successfully',
      data,
    };
  }

  @Get()
  async findAll(@Query() queryPaginationDto: QueryPaginationDto) {
    const data = await this.tenantService.findAll(queryPaginationDto);
    return {
      success: true,
      message: 'Tenants retrieved successfully',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.tenantService.findOne(id);
    return {
      success: true,
      message: 'Tenant retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const data = await this.tenantService.update(id, updateTenantDto);
    return {
      success: true,
      message: 'Tenant updated successfully',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tenantService.remove(id);
    return {
      success: true,
      message: 'Tenant removed successfully',
    };
  }

  @Post('invite')
  async inviteTenant(@Body() inviteTenantDto: InviteTenantDto) {
    const data = await this.tenantService.inviteTenant(inviteTenantDto);
    return {
      success: true,
      message: 'Tenant invited successfully',
      data,
    };
  }

  @Public()
  @Get('accept-invite/:token')
  async acceptInvite(@Param('token') token: string) {
    const redirectUrl = await this.tenantService.acceptInvite(token);
    return {
      success: true,
      message: 'Invite accepted successfully',
      data: { redirectUrl },
    };
  }

  @Public()
  @Get('reject-invite/:token')
  async rejectInvite(@Param('token') token: string) {
    await this.tenantService.rejectInvite(token);
    return {
      success: true,
      message: 'Invite rejected successfully',
    };
  }
}
