import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RentService } from './rent.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { CreateRentDto } from './dto/create-rent.dto';
import { USER_ROLES } from 'src/utils/constants';
import { RequireRoles } from 'src/rbac/decorators/role.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
@Controller('rent')
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @Get('lease/leaseId')
  async getRentsByLease(@Param('leaseId') leaseId: string) {
    const data = await this.rentService.getRentsByLeaseId(leaseId);
    return {
      success: true,
      message: 'Rents fetched successfully',
      data,
    };
  }

  @RequireRoles(USER_ROLES.LANDLORD)
  @Post()
  async createRent(@Body() createRentDto: CreateRentDto) {
    const data = await this.rentService.createRent(createRentDto);
    return {
      success: true,
      message: 'Rent created successfully',
      data,
    };
  }
}
