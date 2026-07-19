/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { CreateLandlordDto } from './dto/create-landlord.dto';
import { UpdateLandlordDto } from './dto/update-landlord.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Landlord } from './entities/landlord.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { FileService } from 'src/file/file.service';
import { EmailService } from 'src/notification/email/email.service';
import { QueryLandlordDto } from './dto/query-landlord.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateLandlordProfileDto } from './dto/update-landlord-profile.dto';
import { UploadLandlordDocumentsDto } from './dto/upload-landlord-documents.dto';
import { UploadLandlordNotificationPreferencesDto } from './dto/update-landlord-notification-preferences.dto';
import { LandlordSettings } from './entities/landlord-settings.entity';
import { UpdateLandlordPlatformPreferencesDto } from './dto/update-landlord-platform-preferences.dto';
import { UpdateLandlordGracePeriodDto } from './dto/update-landlord-grace-period.dto';
import { UpdateLandlordLateFeeDto } from './dto/update-landlord-late-fee.dto';
import { camelCaseToSpaced } from 'src/utils/misc';
import {
  ApprovalStatusEnum,
  NotificationMediumEnum,
  NotificationTypeEnum,
} from 'src/utils/constants';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class LandlordService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Landlord)
    private readonly landlordRepository: Repository<Landlord>,
    @InjectRepository(LandlordSettings)
    private readonly landlordSettingsRepository: Repository<LandlordSettings>,
    private readonly userService: UserService,
    private readonly fileService: FileService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onApplicationBootstrap() {
    const landlordsToApprove = await this.landlordRepository.find({
      where: { isApproved: true, approvalStatus: ApprovalStatusEnum.PENDING },
    });
    for (const landlord of landlordsToApprove) {
      landlord.approvalStatus = ApprovalStatusEnum.APPROVED;
      await this.landlordRepository.save(landlord);
    }
  }

  async create(createLandlordDto: CreateLandlordDto) {
    const user = await this.userService.findOne(createLandlordDto.userId);

    try {
      const landlord = this.landlordRepository.create({
        user: user,
        businessName: createLandlordDto.businessName || user.fullName,
        businessEmail: createLandlordDto.businessEmail || user.email,
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

      landlord.address = createLandlordDto.address;
      const savedLandlord = await this.landlordRepository.save(landlord);
      const landlordSettings = this.landlordSettingsRepository.create({
        landlord: savedLandlord,
        bankAccount: createLandlordDto.bankAccount,
      });
      await this.landlordSettingsRepository.save(landlordSettings);
      this.eventEmitter.emit('landlord.created', savedLandlord.id);
      return savedLandlord;
    } catch (error: any) {
      if (error?.code == '23505') {
        // throw new BadRequestException('A user with this email already exists');
        const field = error.detail?.match(/Key \((.+?)\)/)?.[1] ?? 'field';
        throw new BadRequestException(
          `${camelCaseToSpaced(field)} already exists`,
        );
      }
      console.log(error);
      throw new InternalServerErrorException('An error occured');
    }
  }

  async approveLandlord(id: string) {
    const landlord = await this.findOne(id);
    landlord.isApproved = true;
    landlord.approvalStatus = ApprovalStatusEnum.APPROVED;
    const updatedLandlord = await this.landlordRepository.save(landlord);
    await this.notificationService.sendNotificationToUser(landlord.user, {
      title: 'Your Landlord Application is Approved',
      templateName: 'onboarding.landlord-verification-approved',
      medium: [NotificationMediumEnum.EMAIL],
      notificationType: NotificationTypeEnum.INFO,
      context: {
        name: landlord.user.fullName,
        dashboardLink: `${process.env.FRONTEND_URL}/landlord/dashboard`,
      },
    });
    return updatedLandlord;
  }

  async rejectLandlord(id: string, reason: string) {
    const landlord = await this.findOne(id);
    landlord.isApproved = true;
    landlord.approvalStatus = ApprovalStatusEnum.REJECTED;
    const updatedLandlord = await this.landlordRepository.save(landlord);
    await this.notificationService.sendNotificationToUser(landlord.user, {
      title: 'Your Landlord Application has been Rejected',
      templateName: 'onboarding.landlord-verification-rejected',
      medium: [NotificationMediumEnum.EMAIL],
      notificationType: NotificationTypeEnum.INFO,
      context: {
        name: landlord.user.fullName,
        reason,
        dashboardLink: `${process.env.FRONTEND_URL}/landlord/dashboard`,
      },
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
      relationLoadStrategy: 'query',
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
    const landlordSettings = await this.landlordSettingsRepository.findOne({
      where: {
        landlord: { id: landlord.id },
      },
    });
    if (!landlordSettings) {
      throw new NotFoundException('Landlord Settings not found');
    }
    for (const key in updateLandlordDto) {
      if (landlord[key]) {
        landlord[key] = updateLandlordDto[key];
      }
    }
    if (updateLandlordDto.govermentIdDocumentId) {
      const govermentIdDocument = await this.fileService.findFileById(
        updateLandlordDto.govermentIdDocumentId,
      );
      landlord.govermentIdDocument = govermentIdDocument;
    }
    if (updateLandlordDto.landSurveyDocumentId) {
      const landSurveyDocument = await this.fileService.findFileById(
        updateLandlordDto.landSurveyDocumentId,
      );
      landlord.landSurveyDocument = landSurveyDocument;
    }
    if (updateLandlordDto.proofOfOwnershipDocumentId) {
      const proofOfOwnershipDocument = await this.fileService.findFileById(
        updateLandlordDto.proofOfOwnershipDocumentId,
      );
      landlord.proofOfOwnershipDocument = proofOfOwnershipDocument;
    }
    if (updateLandlordDto.taxIdentificationNumberDocumentId) {
      const taxIdentificationNumberDocument =
        await this.fileService.findFileById(
          updateLandlordDto.taxIdentificationNumberDocumentId,
        );
      landlord.taxIdentificationNumberDocument =
        taxIdentificationNumberDocument;
    }
    if (updateLandlordDto.profilePictureId) {
      const profilePicture = await this.fileService.findFileById(
        updateLandlordDto.profilePictureId,
      );
      landlord.profilePicture = profilePicture;
    }
    landlordSettings.bankAccount = updateLandlordDto.bankAccount!;
    const [updatedLandlord] = await Promise.all([
      this.landlordRepository.save(landlord),
      landlordSettings.save(),
    ]);

    if (updatedLandlord.approvalStatus !== ApprovalStatusEnum.APPROVED) {
      this.eventEmitter.emit('landlord.updated', updatedLandlord.id);
    }
    return updatedLandlord;
  }

  async getLandlordSettings(landlordId: string) {
    const landlordSettings = await this.landlordSettingsRepository.findOne({
      where: { landlord: { id: landlordId } },
    });
    if (!landlordSettings) {
      throw new NotFoundException('Landlord settings not found');
    }
    return landlordSettings;
  }

  async remove(id: string) {
    const landlord = await this.findOne(id);
    await this.userService.remove(landlord.user.id);
    return landlord.softRemove();
  }

  async updateProfilePicture(landlordId: string, profilePictureId: string) {
    const landlord = await this.findOne(landlordId);
    const file = await this.fileService.findFileById(profilePictureId);
    landlord.profilePicture = file;
    return this.landlordRepository.save(landlord);
  }

  async updateProfile(
    landlordId: string,
    updateLandlordProfileDto: UpdateLandlordProfileDto,
  ) {
    const landlord = await this.findOne(landlordId);
    for (const key in updateLandlordProfileDto) {
      if (landlord[key]) {
        landlord[key] = updateLandlordProfileDto[key];
      }
    }
    if (updateLandlordProfileDto.address) {
      landlord.address = updateLandlordProfileDto.address;
    }
    return this.landlordRepository.save(landlord);
  }

  async updateDocuments(
    lanlordId: string,
    updateLandlordDocumentsDto: UploadLandlordDocumentsDto,
  ) {
    const landlord = await this.findOne(lanlordId);
    if (updateLandlordDocumentsDto.govermentIdDocumentId) {
      const govermentIdDocument = await this.fileService.findFileById(
        updateLandlordDocumentsDto.govermentIdDocumentId,
      );
      landlord.govermentIdDocument = govermentIdDocument;
    }
    if (updateLandlordDocumentsDto.landSurveyDocumentId) {
      const landSurveyDocument = await this.fileService.findFileById(
        updateLandlordDocumentsDto.landSurveyDocumentId,
      );
      landlord.landSurveyDocument = landSurveyDocument;
    }
    if (updateLandlordDocumentsDto.proofOfOwnershipDocumentId) {
      const proofOfOwnershipDocument = await this.fileService.findFileById(
        updateLandlordDocumentsDto.proofOfOwnershipDocumentId,
      );
      landlord.proofOfOwnershipDocument = proofOfOwnershipDocument;
    }
    if (updateLandlordDocumentsDto.taxIdentificationNumberDocumentId) {
      const taxIdentificationNumberDocument =
        await this.fileService.findFileById(
          updateLandlordDocumentsDto.taxIdentificationNumberDocumentId,
        );
      landlord.taxIdentificationNumberDocument =
        taxIdentificationNumberDocument;
    }
    return this.landlordRepository.save(landlord);
  }

  async updateLandlordNotificationPreferences(
    landlordId: string,
    uploadLandlordNotificationPreferencesDto: UploadLandlordNotificationPreferencesDto,
  ) {
    const landlordSettings = await this.getLandlordSettings(landlordId);
    if (uploadLandlordNotificationPreferencesDto.paymentNotifications) {
      landlordSettings.notificationPreferences.paymentNotifications =
        uploadLandlordNotificationPreferencesDto.paymentNotifications;
    }
    if (
      uploadLandlordNotificationPreferencesDto.maintenanceRequestNotifications
    ) {
      landlordSettings.notificationPreferences.maintenanceRequestNotifications =
        uploadLandlordNotificationPreferencesDto.maintenanceRequestNotifications;
    }
    if (uploadLandlordNotificationPreferencesDto.overDueNotifications) {
      landlordSettings.notificationPreferences.overDueNotifications =
        uploadLandlordNotificationPreferencesDto.overDueNotifications;
    }
    if (uploadLandlordNotificationPreferencesDto.weeklyReportsNotifications) {
      landlordSettings.notificationPreferences.weeklyReportsNotifications =
        uploadLandlordNotificationPreferencesDto.weeklyReportsNotifications;
    }
    return this.landlordSettingsRepository.save(landlordSettings);
  }

  async updateLandlordPlatformPreferences(
    landlordId: string,
    updateLandlordPlatformPreferencesDto: UpdateLandlordPlatformPreferencesDto,
  ) {
    const landlordSettings = await this.getLandlordSettings(landlordId);
    if (updateLandlordPlatformPreferencesDto.defaultCurrency) {
      landlordSettings.platformPreferences.defaultCurrency =
        updateLandlordPlatformPreferencesDto.defaultCurrency;
    }
    if (updateLandlordPlatformPreferencesDto.defaultLateFeeAmount) {
      landlordSettings.platformPreferences.defaultLateFeeAmount =
        updateLandlordPlatformPreferencesDto.defaultLateFeeAmount;
    }
    if (updateLandlordPlatformPreferencesDto.language) {
      landlordSettings.platformPreferences.language =
        updateLandlordPlatformPreferencesDto.language;
    }
    return this.landlordSettingsRepository.save(landlordSettings);
  }

  async updateLandlordGracePeriods(
    landlordId: string,
    updateLandlordGracePeriodDto: UpdateLandlordGracePeriodDto,
  ) {
    const landlordSettings = await this.getLandlordSettings(landlordId);
    if (updateLandlordGracePeriodDto.monthlyRentGracePeriod) {
      landlordSettings.gracePeriodPeriods.monthlyRentDueDateGracePeriod =
        updateLandlordGracePeriodDto.monthlyRentGracePeriod;
    }
    if (updateLandlordGracePeriodDto.quarterlyRentGracePeriod) {
      landlordSettings.gracePeriodPeriods.quarterlyRentDueDateGracePeriod =
        updateLandlordGracePeriodDto.quarterlyRentGracePeriod;
    }
    if (updateLandlordGracePeriodDto.yearlyRentGracePeriod) {
      landlordSettings.gracePeriodPeriods.yearlyRentDueDateGracePeriod =
        updateLandlordGracePeriodDto.yearlyRentGracePeriod;
    }
    return this.landlordSettingsRepository.save(landlordSettings);
  }

  async updateLandlordLateFeeSettings(
    landlordId: string,
    updateLandlordLateFeeDto: UpdateLandlordLateFeeDto,
  ) {
    const landlordSettings = await this.getLandlordSettings(landlordId);
    if (updateLandlordLateFeeDto.lateFeeAmount) {
      landlordSettings.lateFeeSettings.lateFeeAmount =
        updateLandlordLateFeeDto.lateFeeAmount;
    }
    if (updateLandlordLateFeeDto.lateFeeType) {
      landlordSettings.lateFeeSettings.lateFeeType =
        updateLandlordLateFeeDto.lateFeeType;
    }
    return this.landlordSettingsRepository.save(landlordSettings);
  }
}
