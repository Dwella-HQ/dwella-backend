import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VerificationService } from './verification.service';
import { UpdateVerificationStatusDto } from './dto/update-verification-status.dto';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/rbac/guards/permission.guard';
import { RolesGuard } from 'src/rbac/guards/role.guard';
import { RequireRoles } from 'src/rbac/decorators/role.decorator';
import { AdminRoles, PERMISSIONS } from 'src/utils/constants';
import { QueryVerificationDto } from './dto/query-verification.dto';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard, RolesGuard)
@RequireRoles(...AdminRoles)
@ApiBearerAuth()
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @RequirePermissions(PERMISSIONS.APPROVE_LANDLORD)
  @Post('lanlord/:landlordId')
  async create(@Param('landlordId') landlordId: string) {
    const data =
      await this.verificationService.startLandlordVerification(landlordId);
    return {
      success: true,
      message: 'Landlord verification started successfully',
      data: data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.verificationService.findAll();
    return {
      success: true,
      message: 'Verifications retrieved successfully',
      data: data,
    };
  }

  @Get('query')
  async query(@Query() queryParams: QueryVerificationDto) {
    const data = await this.verificationService.query(queryParams);
    return {
      success: true,
      message: 'Verifications retrieved successfully',
      data: data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.verificationService.findOne(id);
    return {
      success: true,
      message: 'Verification retrieved successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.APPROVE_LANDLORD)
  @Patch(':id/landlord/status')
  async updateLandlord(
    @Param('id') id: string,
    @Body() updateVerificationStatusDto: UpdateVerificationStatusDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    const data = await this.verificationService.updateLandlordStatus(
      id,
      updateVerificationStatusDto,
      user,
    );
    return {
      success: true,
      message: 'Verification status updated successfully',
      data: data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.verificationService.remove(id);
    return {
      success: true,
      message: 'Verification removed successfully',
      data: data,
    };
  }
}
