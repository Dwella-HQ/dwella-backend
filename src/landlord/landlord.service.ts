/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
import { UpdateLandlordNotificationPreferencesDto } from './dto/update-landlord-notification-preferences.dto';
import { LandlordSettings } from './entities/landlord-settings.entity';
import { UpdateLandlordPlatformPreferencesDto } from './dto/update-landlord-platform-preferences.dto';
import { UpdateLandlordGracePeriodDto } from './dto/update-landlord-grace-period.dto';
import { UpdateLandlordLateFeeDto } from './dto/update-landlord-late-fee.dto';
import { camelCaseToSpaced } from 'src/utils/misc';
import {
  ApprovalStatusEnum,
  LandlordTypeEnum,
  NotificationMediumEnum,
  NotificationTypeEnum,
} from 'src/utils/constants';
import { NotificationService } from 'src/notification/notification.service';
import { LandlordKYB } from './entities/landlord-kyb.entity';
import { CreateLandlordKybDto } from './dto/create-landlord-kyb.dto';
import { UpdateLandlordKybDto } from './dto/update-landlord-kyb.dto';
import { UpdateLandlordBankAccountDetailsDto } from './dto/update-landlord-bank-account-details.dto';

@Injectable()
export class LandlordService {
  constructor(
    @InjectRepository(Landlord)
    private readonly landlordRepository: Repository<Landlord>,
    @InjectRepository(LandlordSettings)
    private readonly landlordSettingsRepository: Repository<LandlordSettings>,
    @InjectRepository(LandlordKYB)
    private readonly landlordKybRepository: Repository<LandlordKYB>,
    private readonly userService: UserService,
    private readonly fileService: FileService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createLandlordDto: CreateLandlordDto) {
    const user = await this.userService.findOne(createLandlordDto.userId);

    try {
      const landlord = this.landlordRepository.create({
        user: user,
        name: user.fullName,
        email: user.email,
      });

      landlord.address = user.address;
      landlord.phoneNumber = user.phoneNumber;
      landlord.profilePicture = user.profilePicture;
      const savedLandlord = await this.landlordRepository.save(landlord);
      const landlordSettings = this.landlordSettingsRepository.create({
        landlord: savedLandlord,
      });
      await this.landlordSettingsRepository.save(landlordSettings);
      this.eventEmitter.emit('landlord.verify', savedLandlord.id);
      return savedLandlord;
    } catch (error: any) {
      console.log(error);
      if (error?.code == '23505') {
        // throw new BadRequestException('A user with this email already exists');
        const field: string =
          error.detail?.match(/Key \((.+?)\)/)?.[1] ?? 'field';
        throw new BadRequestException(
          `${camelCaseToSpaced(field)} already exists`,
        );
      }
      throw new InternalServerErrorException('An error occured');
    }
  }

  async createNewLandlordVerificationRequest(landlordId: string) {
    const landlord = await this.findOne(landlordId);
    if (landlord.approvalStatus === ApprovalStatusEnum.PENDING) {
      throw new BadRequestException(
        'Landlord verification request is already pending',
      );
    }
    landlord.approvalStatus = ApprovalStatusEnum.PENDING;
    const updatedLandlord = await this.landlordRepository.save(landlord);
    await this.notificationService.sendNotificationToUser(landlord.user, {
      title: 'Your Landlord Application is Under Review',
      templateName: 'onboarding.landlord-verification-pending',
      medium: [NotificationMediumEnum.EMAIL],
      notificationType: NotificationTypeEnum.INFO,
      context: {
        name: landlord.user.fullName,
        dashboardLink: `${process.env.FRONTEND_URL}/landlord/dashboard`,
      },
    });
    this.eventEmitter.emit('landlord.verify', updatedLandlord.id);
    return updatedLandlord;
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
        user: true,
      },
      relationLoadStrategy: 'query',
    });
    if (!landlord) {
      throw new NotFoundException('Landlord not found');
    }
    return landlord;
  }

  async getLandlordDetailsForVerification(id: string) {
    const landlord = await this.landlordRepository.findOne({
      where: { id: id },
      relations: {
        user: {
          profilePicture: true,
          kyc: {
            idDocument: true,
            proofOfAddressDocument: true,
            tinDocument: true,
          },
        },
        kyb: {
          businessAddress: true,
          businessCACCertificate: true,
          businessLogo: true,
          businessProofOfAddressDocument: true,
          businessTINCertificate: true,
        },
        profilePicture: true,
        settings: true,
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
    const [updatedLandlord] = await Promise.all([
      this.landlordRepository.save(landlord),
      landlordSettings.save(),
    ]);
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

  async updateLandlordNotificationPreferences(
    landlordId: string,
    uploadLandlordNotificationPreferencesDto: UpdateLandlordNotificationPreferencesDto,
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

  async updateLandlordBankAccountDetails(
    landlordId: string,
    bankAccountDetails: UpdateLandlordBankAccountDetailsDto,
  ) {
    const landlordSettings = await this.getLandlordSettings(landlordId);
    landlordSettings.bankAccount = bankAccountDetails;
    return this.landlordSettingsRepository.save(landlordSettings);
  }

  async createLandlordKyb(
    landlordId: string,
    createLandlordKybDto: CreateLandlordKybDto,
  ) {
    const landlord = await this.findOne(landlordId);
    const existingKyb = await this.landlordKybRepository.findOne({
      where: { landlord: { id: landlord.id } },
    });
    if (existingKyb) {
      throw new BadRequestException('Landlord KYB already exists');
    }

    const kyb = this.landlordKybRepository.create({
      landlord,
      businessName: createLandlordKybDto.businessName,
      businessEmail: createLandlordKybDto.businessEmail,
      businessPhoneNumber: createLandlordKybDto.businessPhoneNumber,
      businessAddress: createLandlordKybDto.businessAddress,
      businessTINNumber: createLandlordKybDto.businessTinNumber,
    });

    const businessLogo = await this.fileService.findFileById(
      createLandlordKybDto.businessLogoId,
    );
    kyb.businessLogo = businessLogo;

    const businessCacCertificate = await this.fileService.findFileById(
      createLandlordKybDto.businessCacCertificateId,
    );
    kyb.businessCACCertificate = businessCacCertificate;

    if (createLandlordKybDto.businessTinCertificateId) {
      const businessTinCertificate = await this.fileService.findFileById(
        createLandlordKybDto.businessTinCertificateId,
      );
      kyb.businessTINCertificate = businessTinCertificate;
    }

    if (createLandlordKybDto.businessProofOfAddressId) {
      const businessProofOfAddress = await this.fileService.findFileById(
        createLandlordKybDto.businessProofOfAddressId,
      );
      kyb.businessProofOfAddressDocument = businessProofOfAddress;
    }
    landlord.name = createLandlordKybDto.businessName;
    landlord.email = createLandlordKybDto.businessEmail;
    landlord.phoneNumber = createLandlordKybDto.businessPhoneNumber;
    landlord.address = createLandlordKybDto.businessAddress;
    landlord.profilePicture = businessLogo;
    landlord.landlordType = LandlordTypeEnum.BUSINESS;

    const [savedKyb] = await Promise.all([
      this.landlordKybRepository.save(kyb),
      this.landlordRepository.save(landlord),
    ]);

    return savedKyb;
  }

  async getLandlordKybByLandlordId(landlordId: string) {
    const kyb = await this.landlordKybRepository.findOne({
      where: { landlord: { id: landlordId } },
      relations: {
        landlord: true,
      },
    });
    if (!kyb) {
      throw new NotFoundException('Landlord KYB not found');
    }
    return kyb;
  }

  async updateLandlordKyb(
    landlordId: string,
    updateLandlordKybDto: UpdateLandlordKybDto,
  ) {
    const kyb = await this.getLandlordKybByLandlordId(landlordId);

    if (updateLandlordKybDto.businessName !== undefined) {
      kyb.businessName = updateLandlordKybDto.businessName;
    }
    if (updateLandlordKybDto.businessEmail !== undefined) {
      kyb.businessEmail = updateLandlordKybDto.businessEmail;
    }
    if (updateLandlordKybDto.businessPhoneNumber !== undefined) {
      kyb.businessPhoneNumber = updateLandlordKybDto.businessPhoneNumber;
    }
    if (updateLandlordKybDto.businessAddress !== undefined) {
      kyb.businessAddress = updateLandlordKybDto.businessAddress;
    }
    if (updateLandlordKybDto.businessTinNumber !== undefined) {
      kyb.businessTINNumber = updateLandlordKybDto.businessTinNumber;
    }

    if (updateLandlordKybDto.businessLogoId) {
      kyb.businessLogo = await this.fileService.findFileById(
        updateLandlordKybDto.businessLogoId,
      );
    }

    if (updateLandlordKybDto.businessCacCertificateId) {
      kyb.businessCACCertificate = await this.fileService.findFileById(
        updateLandlordKybDto.businessCacCertificateId,
      );
    }

    if (updateLandlordKybDto.businessTinCertificateId) {
      kyb.businessTINCertificate = await this.fileService.findFileById(
        updateLandlordKybDto.businessTinCertificateId,
      );
    }

    if (updateLandlordKybDto.businessProofOfAddressId) {
      kyb.businessProofOfAddressDocument = await this.fileService.findFileById(
        updateLandlordKybDto.businessProofOfAddressId,
      );
    }

    return await this.landlordKybRepository.save(kyb);
  }
}
