/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
} from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('file')
@UseGuards(AuthGuard('jwt'))
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  async create(@Body() createFileDto: CreateFileDto, @Req() req: Request) {
    const data = await this.fileService.createFile(
      createFileDto,
      (req as any).user,
    );
    return {
      message: 'File uploaded successfully',
      data,
      success: true,
    };
  }

  // @Get()
  // findAll() {
  //   return this.fileService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.fileService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
  //   return this.fileService.update(+id, updateFileDto);
  // }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.fileService.deleteFile(id);
    return {
      message: 'File deleted successfully',
      data,
      success: true,
    };
  }
}
