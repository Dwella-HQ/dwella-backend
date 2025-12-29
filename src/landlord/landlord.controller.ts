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

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('landlord')
export class LandlordController {
  constructor(private readonly landlordService: LandlordService) {}

  @Post()
  async create(@Body() createLandlordDto: CreateLandlordDto) {
    const data = await this.landlordService.create(createLandlordDto);
    return {
      message: 'Landlord created successfully',
      data,
      success: true,
    };
  }

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

  @Get('query')
  async query(@Query() queryLandlordDto: QueryLandlordDto) {
    const data = await this.landlordService.query(queryLandlordDto);
    return {
      message: 'Landlords queried successfully',
      data,
      success: true,
    };
  }

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
