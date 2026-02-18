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
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { PermissionsGuard } from 'src/rbac/guards/permission.guard';
import { RolesGuard } from 'src/rbac/guards/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { QueryPaginationDto } from 'src/utils/query-pagination.dto';

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
}
