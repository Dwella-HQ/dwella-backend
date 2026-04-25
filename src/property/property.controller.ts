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
  Res,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  HttpStatus,
  FileTypeValidator,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { PermissionsGuard } from 'src/auth/guards/permission.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { RequirePermissions } from 'src/rbac/decorators/permission.decorator';
import { AdminRoles, PERMISSIONS, USER_ROLES } from 'src/utils/constants';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { RequireRoles } from 'src/rbac/decorators/role.decorator';
import { QueryPropertyDto } from './dto/query-property.dto';
import { UpdatePropertyGracePeriodDto } from './dto/update-property-grace-period.dto';
import { UpdatePropertyLateFeeDto } from './dto/update-property-late-fee.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @RequirePermissions(PERMISSIONS.CREATE_PROPERTY)
  @Post()
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    const data = await this.propertyService.create(createPropertyDto);
    return {
      success: true,
      message: 'Property created successfully',
      data: data,
    };
  }

  @RequireRoles(...AdminRoles)
  @RequirePermissions(PERMISSIONS.READ_PROPERTY)
  @Get()
  async findAll() {
    const data = await this.propertyService.findAll();
    return {
      success: true,
      message: 'Properties retrieved successfully',
      data: data,
    };
  }

  @Public()
  @Get('bulk-upload')
  getBulkUpload(@Res() res: Response) {
    const file = createReadStream(
      join(
        process.cwd(),
        'src/public/assets/dwella-properties-bulk-upload.xlsx',
      ),
    );
    // Set headers for download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="dwella-properties-bulk-upload.xlsx"',
    );
    file.pipe(res);
  }

  @RequireRoles(...AdminRoles)
  @Post('bulk-upload/:landlordId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async bulkUploadProperties(
    @Param('landlordId') landlordId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 1e7 }),
          new FileTypeValidator({
            fileType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        ],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.propertyService.bulkUploadPropery(landlordId, file);

    return {
      success: true,
      message: 'Properties uploaded successfully',
      data,
    };
  }

  @Public()
  @Get('query')
  async queryProperties(@Query() queryPropertyDto: QueryPropertyDto) {
    const data = await this.propertyService.query(queryPropertyDto);
    return {
      success: true,
      message: 'Properties retrieved successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_PROPERTY)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.propertyService.findOne(id);
    return {
      success: true,
      message: 'Property retrieved successfully',
      data: data,
    };
  }

  @Get('landlord/:landlordId')
  async getLandlordProperties(@Param('landlordId') landlordId: string) {
    const data = await this.propertyService.getLandlordProperties(landlordId);
    return {
      success: true,
      message: 'Landlord properties retrieved successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_PROPERTY)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    const data = await this.propertyService.update(id, updatePropertyDto);
    return {
      success: true,
      message: 'Property updated successfully',
      data: data,
    };
  }

  @Get(':id/settings')
  async getPropertySettings(@Param('id') id: string) {
    const data = await this.propertyService.getPropertySettings(id);
    return {
      success: true,
      message: 'Property settings retrieved successfully',
      data: data,
    };
  }

  @Patch(':id/settings/grace-period')
  @RequirePermissions(PERMISSIONS.UPDATE_PROPERTY)
  async updateGracePeriod(
    @Param('id') id: string,
    @Body() updateGracePeriodDto: UpdatePropertyGracePeriodDto,
  ) {
    const data = await this.propertyService.updateGracePeriod(
      id,
      updateGracePeriodDto,
    );
    return {
      success: true,
      message: 'Grace period updated successfully',
      data: data,
    };
  }

  @Patch(':id/settings/late-fee')
  @RequirePermissions(PERMISSIONS.UPDATE_PROPERTY)
  async updateLateFee(
    @Param('id') id: string,
    @Body() updateLateFeeDto: UpdatePropertyLateFeeDto,
  ) {
    const data = await this.propertyService.updateLateFeeSettings(
      id,
      updateLateFeeDto,
    );
    return {
      success: true,
      message: 'Late fee updated successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_PROPERTY)
  @Post(':id/unit')
  async addUnit(@Param('id') id: string, @Body() createUnitDto: CreateUnitDto) {
    const data = await this.propertyService.createUnit(id, createUnitDto);
    return {
      success: true,
      message: 'Unit added successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_PROPERTY)
  @Get(':id/units')
  async getUnits(@Param('id') id: string) {
    const data = await this.propertyService.fetchPropertyUnits(id);
    return {
      success: true,
      message: 'Units retrieved successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.READ_PROPERTY)
  @Get('unit/:unitId')
  async getUnit(@Param('unitId') unitId: string) {
    const data = await this.propertyService.getUnit(unitId);
    return {
      success: true,
      message: 'Unit retrieved successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.UPDATE_PROPERTY)
  @Patch('unit/:unitId')
  async updateUnit(
    @Param('unitId') unitId: string,
    @Body() updateUnitDto: CreateUnitDto,
  ) {
    const data = await this.propertyService.updateUnit(unitId, updateUnitDto);
    return {
      success: true,
      message: 'Unit updated successfully',
      data: data,
    };
  }

  @RequirePermissions(PERMISSIONS.DELETE_PROPERTY)
  @Delete('unit/:unitId')
  async deleteUnit(@Param('unitId') unitId: string) {
    await this.propertyService.deleteUnit(unitId);
    return {
      success: true,
      message: 'Unit deleted successfully',
    };
  }

  @RequirePermissions(PERMISSIONS.DELETE_PROPERTY)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.propertyService.remove(id);
    return {
      success: true,
      message: 'Property removed successfully',
      data: data,
    };
  }
}
