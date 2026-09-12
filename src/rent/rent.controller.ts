import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RentService } from './rent.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { CreateRentDto } from './dto/create-rent.dto';
import { PERMISSIONS, USER_ROLES } from 'src/utils/constants';
import { RequireRoles } from 'src/rbac/decorators/role.decorator';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';

@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
@Controller('rent')
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @Get('contract/:contractId')
  async getRentsByContract(
    @Param('contractId') contractId: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.rentService.getRentsByContractId(contractId, user);
    return {
      success: true,
      message: 'Rents fetched successfully',
      data,
    };
  }

  @RequireRoles(USER_ROLES.LANDLORD)
  @Post()
  async createRent(
    @Body() createRentDto: CreateRentDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.rentService.createRent(createRentDto, user);
    return {
      success: true,
      message: 'Rent created successfully',
      data,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_PAYMENT)
  @Patch(':rentId/status/paid')
  async markRentAsPaid(
    @Param('rentId') rentId: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.rentService.handleRentPayment(rentId, user);
    return {
      success: true,
      message: 'Rent updated successfully',
      data,
    };
  }
}
