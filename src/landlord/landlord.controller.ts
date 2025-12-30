/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { LandlordService } from './landlord.service';
import { CreateLandlordDto } from './dto/create-landlord.dto';
import { UpdateLandlordDto } from './dto/update-landlord.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { QueryLandlordDto } from './dto/query-landlord.dto';
import { PermissionsGuard } from 'src/rbac/guards/permission.guard';
import { RolesGuard } from 'src/rbac/guards/role.guard';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { PERMISSIONS } from 'src/utils/constants';

@UseGuards(AuthGuard('jwt'), PermissionsGuard, RolesGuard)
@ApiBearerAuth()
@Controller('landlord')
export class LandlordController {
  constructor(private readonly landlordService: LandlordService) {}

  @RequirePermissions(PERMISSIONS.CREATE_LANDLORD)
  @Post()
  async create(@Body() createLandlordDto: CreateLandlordDto) {
    const data = await this.landlordService.create(createLandlordDto);
    return {
      message: 'Landlord created successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_LANDLORD)
  @Get()
  async findAll() {
    const data = await this.landlordService.findAll();
    return {
      message: 'Landlords fetched successfully',
      data,
      success: true,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.landlordService.findOne(id);
    return {
      message: 'Landlord fetched successfully',
      data,
      success: true,
    };
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    const data = await this.landlordService.findByUserId(userId);
    return {
      message: 'Landlord fetched successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_LANDLORD)
  @Get('query')
  async query(@Query() queryLandlordDto: QueryLandlordDto) {
    const data = await this.landlordService.query(queryLandlordDto);
    return {
      message: 'Landlords queried successfully',
      data,
      success: true,
    };
  }
  @RequirePermissions(PERMISSIONS.UPDATE_LANDLORD)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLandlordDto: UpdateLandlordDto,
  ) {
    const data = await this.landlordService.update(id, updateLandlordDto);
    return {
      message: 'Landlord updated successfully',
      data,
      success: true,
    };
  }

  @RequirePermissions(PERMISSIONS.APPROVE_LANDLORD)
  @Post(':id/approve')
  async approve(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;

    const data = await this.landlordService.approveLandlord(id, user);
    return {
      message: 'Landlord approved successfully',
      data,
      success: true,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.landlordService.remove(id);
    return {
      message: 'Landlord deleted successfully',
      data,
      success: true,
    };
  }
}
