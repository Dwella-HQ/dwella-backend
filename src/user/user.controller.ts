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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { User } from './entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { QueryUserDto } from './dto/query-user.dto';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { PERMISSIONS } from 'src/utils/constants';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateClientKycDto } from './dto/create-client-kyc.dto';
import {
  CurrentDevice,
  CurrentDeviceInfo,
} from 'src/auth/decorators/current-device.decorator';
import { UpdateClientKycDto } from './dto/update-client-kyc.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getLoggedInUser(@Req() request: Request) {
    const user = (request as unknown as { user: User }).user;
    return {
      success: true,
      message: 'User fetched successfully',
      data: user,
    };
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @RequirePermissions(PERMISSIONS.READ_USER)
  @Get('query')
  async query(@Query() queryUserDto: QueryUserDto) {
    const data = await this.userService.query(queryUserDto);
    return {
      message: 'Users queried successfully',
      data,
      success: true,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  updatePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentDevice() currentDevice: CurrentDeviceInfo,
  ) {
    return this.userService.updatePassword(
      id,
      changePasswordDto,
      currentDevice,
    );
  }

  @Post(':id/kyc')
  async createKyc(
    @Param('id') id: string,
    @Body() createClientKycDto: CreateClientKycDto,
  ) {
    const data = await this.userService.createKyc(id, createClientKycDto);
    return {
      success: true,
      message: 'User KYC created successfully',
      data,
    };
  }

  @Get(':id/kyc')
  async getKyc(@Param('id') id: string) {
    const data = await this.userService.getKycByUserId(id);
    return {
      success: true,
      message: 'User KYC fetched successfully',
      data,
    };
  }

  @Patch(':id/kyc')
  async updateKyc(
    @Param('id') id: string,
    @Body() updateClientKycDto: UpdateClientKycDto,
  ) {
    const data = await this.userService.updateKyc(id, updateClientKycDto);
    return {
      success: true,
      message: 'User KYC updated successfully',
      data,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
