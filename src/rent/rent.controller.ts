import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RentService } from './rent.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

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
}
