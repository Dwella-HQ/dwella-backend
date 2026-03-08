import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLandlordDto } from './dto/create-landlord.dto';
import { UpdateLandlordDto } from './dto/update-landlord.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Landlord } from './entities/landlord.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { FileService } from 'src/file/file.service';
import { EmailService } from 'src/notification/email/email.service';
import { QueryLandlordDto } from './dto/query-landlord.dto';
import { AddressService } from 'src/address/address.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LandlordService {
  constructor(
    @InjectRepository(Landlord)
    private readonly landlordRepository: Repository<Landlord>,
    private readonly userService: UserService,
    private readonly fileService: FileService,
    private readonly emailService: EmailService,
    private readonly addressService: AddressService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createLandlordDto: CreateLandlordDto) {
    const user = await this.userService.findOne(createLandlordDto.userId);

    const landlord = this.landlordRepository.create({
      user: user,
      landLordName: createLandlordDto.landLordName || user.fullName,
      landLordEmail: createLandlordDto.landLordEmail || user.email,
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
    if (createLandlordDto.profilePictureId) {
      const profilePicture = await this.fileService.findFileById(
        createLandlordDto.profilePictureId,
      );
      landlord.profilePicture = profilePicture;
    }
    const address = await this.addressService.create(
      user.id,
      createLandlordDto.address,
    );
    landlord.address = address;
    const savedLandlord = await this.landlordRepository.save(landlord);

    this.eventEmitter.emit('landlord.created', savedLandlord.id);
    return savedLandlord;
  }

  async approveLandlord(id: string) {
    const landlord = await this.findOne(id);
    landlord.isApproved = true;
    const updatedLandlord = await this.landlordRepository.save(landlord);
    await this.emailService.sendMailToUser({
      context: {
        name: landlord.landLordName,
        dashboardLink: `${process.env.FRONTEND_URL}/landlord/dashboard`,
      },
      subject: 'Your Landlord Application is Approved',
      template: 'landlord-approved',
      user: landlord.user,
    });
    return updatedLandlord;
  }

  findAll() {
    const landlords = this.landlordRepository.find({
      relations: {
        govermentIdDocument: true,
        landSurveyDocument: true,
        proofOfOwnershipDocument: true,
        taxIdentificationNumberDocument: true,
        user: true,
      },
    });
    return landlords;
  }

  async query(queryLandlordDto: QueryLandlordDto) {
    const {
      isActive,
      isApproved,
      landLordName,
      landlordId,
      userId,
      limit = 10,
      page = 1,
    } = queryLandlordDto;

    const queryBuilder = this.landlordRepository
      .createQueryBuilder('landlord')
      .leftJoinAndSelect('landlord.user', 'user')
      .leftJoinAndSelect('landlord.govermentIdDocument', 'govermentIdDocument')
      .leftJoinAndSelect('landlord.landSurveyDocument', 'landSurveyDocument')
      .leftJoinAndSelect(
        'landlord.proofOfOwnershipDocument',
        'proofOfOwnershipDocument',
      )
      .leftJoinAndSelect(
        'landlord.taxIdentificationNumberDocument',
        'taxIdentificationNumberDocument',
      );

    if (isActive !== undefined) {
      queryBuilder.andWhere('landlord.isActive = :isActive', { isActive });
    }

    if (isApproved !== undefined) {
      queryBuilder.andWhere('landlord.isApproved = :isApproved', {
        isApproved,
      });
    }

    if (landLordName) {
      queryBuilder.andWhere('landlord.landLordName ILIKE :landLordName', {
        landLordName: `%${landLordName}%`,
      });
    }

    if (landlordId) {
      queryBuilder.andWhere('landlord.id = :landlordId', { landlordId });
    }

    if (userId) {
      queryBuilder.andWhere('user.id = :userId', { userId });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const landlords = await queryBuilder.getMany();
    return landlords;
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
