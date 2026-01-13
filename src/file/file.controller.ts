import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  HttpStatus,
} from '@nestjs/common';
import { FileService } from './file.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/user/entities/user.entity';

@Controller('file')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
        },
        label: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 1e7 }),
          // new FileTypeValidator({ fileType: 'image/*' }),
        ],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
    @Req() request: Request & { user: User },
    @Body('folder') folder: string,
    @Body('label') label: string,
  ) {
    const data = await this.fileService.createFile(
      {
        file,
        folder,
        label,
      },
      request.user,
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
