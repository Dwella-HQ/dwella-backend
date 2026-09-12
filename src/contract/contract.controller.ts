import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ContractService } from './contract.service';
import { CreateLeaseContractDto } from './dto/create-lease-contract.dto';
import { CreateShortletContractDto } from './dto/create-shortlet-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { QueryContractDto } from './dto/query-contract.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { PropertyAccessGuard } from 'src/property-access/property-access.guard';
import { PropertyScope } from 'src/property-access/property-scope.decorator';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { PERMISSIONS } from 'src/utils/constants';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, PropertyAccessGuard)
@ApiBearerAuth()
@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @RequirePermissions(PERMISSIONS.CREATE_CONTRACT)
  @Post('lease')
  async createLease(
    @Body() dto: CreateLeaseContractDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.contractService.createLeaseContract(dto, user);
    return {
      success: true,
      message: 'Lease contract created successfully',
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.CREATE_CONTRACT)
  @Post('shortlet')
  async createShortlet(
    @Body() dto: CreateShortletContractDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.contractService.createShortletContract(dto, user);
    return {
      success: true,
      message: 'Shortlet contract created successfully',
      data,
    };
  }

  @Get()
  async query(@Query() query: QueryContractDto) {
    const data = await this.contractService.queryContract(query);
    return {
      success: true,
      message: 'Contracts retrieved successfully',
      data,
    };
  }

  @PropertyScope({ param: 'unitId', type: 'unit' })
  @Get('unit/:unitId')
  async findByUnit(@Param('unitId') unitId: string) {
    const data = await this.contractService.findByUnit(unitId);
    return {
      success: true,
      message: 'Contracts retrieved successfully',
      data,
    };
  }

  @PropertyScope({ param: 'id', type: 'contract' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.contractService.findOne(id);
    return {
      success: true,
      message: 'Contract retrieved successfully',
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_CONTRACT)
  @PropertyScope({ param: 'id', type: 'contract' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContractDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.contractService.update(id, dto, user);
    return {
      success: true,
      message: 'Contract updated successfully',
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_CONTRACT)
  @PropertyScope({ param: 'id', type: 'contract' })
  @Patch(':id/terminate')
  async terminate(@Param('id') id: string, @CurrentUser() user: User) {
    const data = await this.contractService.terminate(id, user);
    return {
      success: true,
      message: 'Contract terminated successfully',
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_CONTRACT)
  @PropertyScope({ param: 'id', type: 'contract' })
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @CurrentUser() user: User) {
    const data = await this.contractService.cancel(id, user);
    return {
      success: true,
      message: 'Contract cancelled successfully',
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.DELETE_CONTRACT)
  @PropertyScope({ param: 'id', type: 'contract' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.contractService.remove(id);
    return {
      success: true,
      message: 'Contract removed successfully',
    };
  }
}
