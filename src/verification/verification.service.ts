import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateVerificationStatusDto } from './dto/update-verification-status.dto';
import { LandlordService } from 'src/landlord/landlord.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Verification } from './entities/verification.entity';
import { Repository } from 'typeorm';
import { VerificationTypeEnum } from 'src/utils/constants';
import { User } from 'src/user/entities/user.entity';
import { FileService } from 'src/file/file.service';
import { File } from 'src/file/entities/file.entity';
import { QueryVerificationDto } from './dto/query-verification.dto';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(Verification)
    private verificationRepository: Repository<Verification>,
    private readonly landlordService: LandlordService,
    private readonly fileService: FileService,
  ) {}
  async startLandlordVerification(landlordId: string) {
    const landlord = await this.landlordService.findOne(landlordId);
    const verification = this.verificationRepository.create({
      type: VerificationTypeEnum.LANDLORD_VERIFICATION,
      landlord: landlord,
    });
    return await this.verificationRepository.save(verification);
  }

  async findAll() {
    const verifications = await this.verificationRepository.find();
    return verifications;
  }

  async query(queryVerificationDto: QueryVerificationDto) {
    const queryBuilder =
      this.verificationRepository.createQueryBuilder('verification');

    if (queryVerificationDto.status) {
      queryBuilder.andWhere('verification.status = :status', {
        status: queryVerificationDto.status,
      });
    }

    if (queryVerificationDto.type) {
      queryBuilder.andWhere('verification.type = :type', {
        type: queryVerificationDto.type,
      });
    }

    if (queryVerificationDto.landlordId) {
      queryBuilder
        .leftJoin('verification.landlord', 'landlord')
        .andWhere('landlord.id = :landlordId', {
          landlordId: queryVerificationDto.landlordId,
        });
    }

    if (queryVerificationDto.propertyId) {
      queryBuilder
        .leftJoin('verification.property', 'property')
        .andWhere('property.id = :propertyId', {
          propertyId: queryVerificationDto.propertyId,
        });
    }

    if (queryVerificationDto.verifiedById) {
      queryBuilder
        .leftJoin('verification.verifiedBy', 'user')
        .andWhere('user.id = :verifiedById', {
          verifiedById: queryVerificationDto.verifiedById,
        });
    }

    if (queryVerificationDto.minDateVerifiedAt) {
      queryBuilder.andWhere('verification.verifiedAt >= :minDateVerifiedAt', {
        minDateVerifiedAt: queryVerificationDto.minDateVerifiedAt,
      });
    }

    if (queryVerificationDto.maxDateVerifiedAt) {
      queryBuilder.andWhere('verification.verifiedAt <= :maxDateVerifiedAt', {
        maxDateVerifiedAt: queryVerificationDto.maxDateVerifiedAt,
      });
    }

    if (queryVerificationDto.page && queryVerificationDto.limit) {
      const skip = (queryVerificationDto.page - 1) * queryVerificationDto.limit;
      queryBuilder.skip(skip).take(queryVerificationDto.limit);
    }
    const verifications = await queryBuilder.getMany();
    return verifications;
  }

  async findOne(id: string) {
    const verification = await this.verificationRepository.findOneBy({ id });
    if (!verification) {
      throw new NotFoundException('Verification not found');
    }
    return verification;
  }

  async updateStatus(
    id: string,
    updateVerificationStatusDto: UpdateVerificationStatusDto,
    user: User,
  ) {
    const verification = await this.findOne(id);
    verification.status = updateVerificationStatusDto.status;
    verification.reason = updateVerificationStatusDto.reason;
    verification.verifiedAt = new Date();
    verification.verifiedBy = user;
    const supportingDocuments: File[] = [];
    for (const fileId of updateVerificationStatusDto.supportingDocumentIds) {
      const file = await this.fileService.findFileById(fileId);
      supportingDocuments.push(file);
    }
    verification.supportingDocuments = supportingDocuments;
    return await this.verificationRepository.save(verification);
  }

  async remove(id: string) {
    const result = await this.verificationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Verification not found');
    }
    return true;
  }
}
