import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/rbac/guards/permission.guard';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { PERMISSIONS } from 'src/utils/constants';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  async create(@Body() createAddressDto: CreateAddressDto) {
    const data = await this.addressService.create(createAddressDto);
    return {
      success: true,
      message: 'Address created successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.MANAGE_ADDRESS)
  @Get()
  async findAll() {
    const data = await this.addressService.findAll();
    return {
      success: true,
      message: 'Addresses retrieved successfully',
      data: data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.addressService.findOne(id);
    return {
      success: true,
      message: 'Address retrieved successfully',
      data: data,
    };
  }

  @Get('user/:userId')
  async findUserAddresses(@Param('userId') userId: string) {
    const data = await this.addressService.findUserAddresses(userId);
    return {
      success: true,
      message: 'User addresses retrieved successfully',
      data: data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const data = await this.addressService.update(id, updateAddressDto);
    return {
      success: true,
      message: 'Address updated successfully',
      data: data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.addressService.remove(id);
    return {
      success: true,
      message: 'Address removed successfully',
    };
  }
}
