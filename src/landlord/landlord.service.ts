import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLandlordDto } from './dto/create-landlord.dto';
import { UpdateLandlordDto } from './dto/update-landlord.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Landlord } from './entities/landlord.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { FileService } from 'src/file/file.service';

@Injectable()
export class LandlordService {
  constructor(
    @InjectRepository(Landlord)
    private readonly landlordRepository: Repository<Landlord>,
    private readonly userService: UserService,
    private readonly fileService: FileService,
  ) {}
  async create(createLandlordDto: CreateLandlordDto) {
    const user = await this.userService.findOne(createLandlordDto.userId);

    const landlord = this.landlordRepository.create({
      user: user,
      landLordName: createLandlordDto.landLordName || user.fullName,
    });
    if (createLandlordDto.govermentIdDocumentId) {
      const govermentIdDocument = await this.fileService.findFileById(
        createLandlordDto.govermentIdDocumentId,
      );
      landlord.govermentIdDocument = govermentIdDocument;
    }
    if (createLandlordDto.landSurveyDocumentId) {
      const landSurveyDocument = await this.fileService.findFileById(
        createLandlordDto.landSurveyDocumentId,
      );
      landlord.landSurveyDocument = landSurveyDocument;
    }
    if (createLandlordDto.proofOfOwnershipDocumentId) {
      const proofOfOwnershipDocument = await this.fileService.findFileById(
        createLandlordDto.proofOfOwnershipDocumentId,
      );
      landlord.proofOfOwnershipDocument = proofOfOwnershipDocument;
    }
    if (createLandlordDto.taxIdentificationNumberDocumentId) {
      const taxIdentificationNumberDocument =
        await this.fileService.findFileById(
          createLandlordDto.taxIdentificationNumberDocumentId,
        );
      landlord.taxIdentificationNumberDocument =
        taxIdentificationNumberDocument;
    }
    return await this.landlordRepository.save(landlord);
  }

  findAll() {
    return `This action returns all landlord`;
  }

  async findOne(id: string) {
    const landlord = await this.landlordRepository.findOne({
      where: { id: id },
      relations: {
        govermentIdDocument: true,
        landSurveyDocument: true,
        proofOfOwnershipDocument: true,
        taxIdentificationNumberDocument: true,
        user: true,
      },
    });
    if (!landlord) {
      throw new NotFoundException('Landlord not found');
    }
    return landlord;
  }

  async findByUserId(userId: string) {
    const landlord = await this.landlordRepository.findOne({
      where: { user: { id: userId } },
      relations: {
        govermentIdDocument: true,
        landSurveyDocument: true,
        proofOfOwnershipDocument: true,
        taxIdentificationNumberDocument: true,
        user: true,
      },
    });
    if (!landlord) {
      throw new NotFoundException('Landlord not found');
    }
    return landlord;
  }

  async update(id: string, updateLandlordDto: UpdateLandlordDto) {
    const landlord = await this.findOne(id);
    for (const key in updateLandlordDto) {
      if (landlord[key]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        landlord[key] = updateLandlordDto[key];
      }
    }
    const updatedLandlord = this.landlordRepository.save(landlord);
    return updatedLandlord;
  }

  async remove(id: string) {
    const landlord = await this.findOne(id);
    await this.userService.remove(landlord.user.id);
    return landlord.softRemove();
  }
}
