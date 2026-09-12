import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, MoreThan, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { differenceInCalendarDays } from 'date-fns';
import { Contract } from './entities/contract.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { Unit } from 'src/property/entities/unit.entity';
import { PropertyService } from 'src/property/property.service';
import { PropertyAccessService } from 'src/property-access/property-access.service';
import { FileService } from 'src/file/file.service';
import { GuestService } from './guest.service';
import { CreateLeaseContractDto } from './dto/create-lease-contract.dto';
import { CreateShortletContractDto } from './dto/create-shortlet-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { QueryContractDto } from './dto/query-contract.dto';
import { User } from 'src/user/entities/user.entity';
import {
  ContractStatusEnum,
  ContractTypeEnum,
  RentFrequencyEnum,
  ServiceChargeFrequencyEnum,
} from 'src/utils/constants';

interface SaveLeaseContractParams {
  tenant: Tenant;
  unit: Unit;
  startDate: Date;
  endDate?: Date;
  rentFrequency: RentFrequencyEnum;
  rentAmount: number;
  securityDeposit: number;
  serviceCharge?: number;
  serviceChargeFrequency?: ServiceChargeFrequencyEnum;
  documentId?: string;
}

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly propertyService: PropertyService,
    private readonly propertyAccessService: PropertyAccessService,
    private readonly fileService: FileService,
    private readonly guestService: GuestService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /** Internal helper used by `TenantService` when a `Tenant` is created/materialized in the same flow. */
  async saveLeaseContract(params: SaveLeaseContractParams): Promise<Contract> {
    const contract = this.contractRepository.create({
      type: ContractTypeEnum.LEASE,
      status: ContractStatusEnum.ACTIVE,
      tenant: params.tenant,
      unit: params.unit,
      startDate: params.startDate,
      endDate: params.endDate,
      rentFrequency: params.rentFrequency,
      rentAmount: params.rentAmount,
      securityDeposit: params.securityDeposit,
      serviceCharge: params.serviceCharge,
      serviceChargeFrequency: params.serviceChargeFrequency,
    });
    if (params.documentId) {
      contract.document = await this.fileService.findFileById(
        params.documentId,
      );
    }
    return this.contractRepository.save(contract);
  }

  async createLeaseContract(
    dto: CreateLeaseContractDto,
    requester?: User,
  ): Promise<Contract> {
    const unit = await this.propertyService.getUnit(dto.unitId);
    if (requester) {
      await this.propertyAccessService.assertProperty(
        requester,
        unit.property.id,
      );
    }
    if (unit.tenant) {
      throw new BadRequestException('Unit is already occupied by a tenant');
    }
    const tenant = await this.tenantRepository.findOne({
      where: { id: dto.tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return this.saveLeaseContract({
      tenant,
      unit,
      startDate: dto.startDate,
      endDate: dto.endDate,
      rentFrequency: dto.rentFrequency,
      rentAmount: dto.rentAmount,
      securityDeposit: dto.securityDeposit,
      serviceCharge: dto.serviceCharge,
      serviceChargeFrequency: dto.serviceChargeFrequency,
      documentId: dto.documentId,
    });
  }

  async createShortletContract(
    dto: CreateShortletContractDto,
    requester?: User,
  ): Promise<Contract> {
    const unit = await this.propertyService.getUnit(dto.unitId);
    if (requester) {
      await this.propertyAccessService.assertProperty(
        requester,
        unit.property.id,
      );
    }
    const checkInDate = new Date(dto.checkInDate);
    const checkOutDate = new Date(dto.checkOutDate);
    if (checkOutDate <= checkInDate) {
      throw new BadRequestException('checkOutDate must be after checkInDate');
    }

    // Minimal double-booking guard: reject if an existing DRAFT/ACTIVE shortlet
    // on this unit overlaps the requested date range.
    const overlapping = await this.contractRepository.findOne({
      where: {
        unit: { id: dto.unitId },
        type: ContractTypeEnum.SHORTLET,
        status: In([ContractStatusEnum.DRAFT, ContractStatusEnum.ACTIVE]),
        startDate: LessThan(checkOutDate),
        endDate: MoreThan(checkInDate),
      },
    });
    if (overlapping) {
      throw new BadRequestException(
        'Unit is already booked for an overlapping date range',
      );
    }

    const guest = await this.guestService.findOrCreate(dto);
    const nights = differenceInCalendarDays(checkOutDate, checkInDate);
    const rentAmount = dto.totalAmount ?? dto.nightlyRate * nights;

    const contract = this.contractRepository.create({
      type: ContractTypeEnum.SHORTLET,
      status: ContractStatusEnum.ACTIVE,
      unit,
      guest,
      startDate: checkInDate,
      endDate: checkOutDate,
      rentAmount,
      rentFrequency: RentFrequencyEnum.ONE_TIME,
      nightlyRate: dto.nightlyRate,
      securityDeposit: dto.securityDeposit,
      serviceCharge: dto.cleaningFee,
      serviceChargeFrequency: dto.cleaningFee
        ? ServiceChargeFrequencyEnum.ONE_TIME
        : undefined,
    });
    if (dto.documentId) {
      contract.document = await this.fileService.findFileById(dto.documentId);
    }
    const savedContract = await this.contractRepository.save(contract);
    // Triggers RentService's one-time-charge generation without ContractModule
    // needing to import RentModule (RentModule already imports ContractModule).
    this.eventEmitter.emit('contract.shortlet.created', savedContract);
    return savedContract;
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: {
        tenant: { user: true },
        guest: true,
        unit: { property: true },
      },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }
    return contract;
  }

  async findByUnit(unitId: string): Promise<Contract[]> {
    return this.contractRepository.find({
      where: { unit: { id: unitId } },
      relations: { tenant: true, guest: true },
    });
  }

  /** Replaces `TenantService.queryLease()`. Called by `RentService`/`RentWorker`. */
  async queryContract(query: QueryContractDto): Promise<Contract[]> {
    const queryBuilder = this.contractRepository.createQueryBuilder('contract');
    queryBuilder.leftJoinAndSelect('contract.tenant', 'tenant');
    queryBuilder.leftJoinAndSelect('contract.guest', 'guest');
    queryBuilder.leftJoinAndSelect('contract.unit', 'unit');
    queryBuilder.leftJoinAndSelect('unit.property', 'property');
    if (query.tenantId) {
      queryBuilder.andWhere('contract.tenantId = :tenantId', {
        tenantId: query.tenantId,
      });
    }
    if (query.guestId) {
      queryBuilder.andWhere('contract.guestId = :guestId', {
        guestId: query.guestId,
      });
    }
    if (query.unitId) {
      queryBuilder.andWhere('contract.unitId = :unitId', {
        unitId: query.unitId,
      });
    }
    if (query.propertyId) {
      queryBuilder.andWhere('unit.propertyId = :propertyId', {
        propertyId: query.propertyId,
      });
    }
    if (query.contractId) {
      queryBuilder.andWhere('contract.id = :contractId', {
        contractId: query.contractId,
      });
    }
    if (query.type) {
      queryBuilder.andWhere('contract.type = :type', { type: query.type });
    }
    if (query.status) {
      queryBuilder.andWhere('contract.status = :status', {
        status: query.status,
      });
    }
    if (query.active !== undefined) {
      queryBuilder.andWhere(
        query.active
          ? 'contract.status = :activeStatus'
          : 'contract.status != :activeStatus',
        { activeStatus: ContractStatusEnum.ACTIVE },
      );
    }
    if (query.startDate) {
      queryBuilder.andWhere('contract.startDate >= :startDate', {
        startDate: query.startDate,
      });
    }
    if (query.endDate) {
      queryBuilder.andWhere('contract.endDate <= :endDate', {
        endDate: query.endDate,
      });
    }
    return queryBuilder.getMany();
  }

  async update(
    id: string,
    dto: UpdateContractDto,
    requester?: User,
  ): Promise<Contract> {
    const contract = await this.findOne(id);
    if (requester && contract.unit?.property) {
      await this.propertyAccessService.assertProperty(
        requester,
        contract.unit.property.id,
      );
    }
    if (dto.documentId) {
      contract.document = await this.fileService.findFileById(dto.documentId);
    }
    contract.startDate = dto.startDate ?? contract.startDate;
    contract.endDate = dto.endDate ?? contract.endDate;
    contract.rentAmount = dto.rentAmount ?? contract.rentAmount;
    contract.rentFrequency = dto.rentFrequency ?? contract.rentFrequency;
    contract.nightlyRate = dto.nightlyRate ?? contract.nightlyRate;
    contract.securityDeposit = dto.securityDeposit ?? contract.securityDeposit;
    contract.serviceCharge = dto.serviceCharge ?? contract.serviceCharge;
    contract.serviceChargeFrequency =
      dto.serviceChargeFrequency ?? contract.serviceChargeFrequency;
    return this.contractRepository.save(contract);
  }

  async terminate(id: string, requester?: User): Promise<Contract> {
    const contract = await this.findOne(id);
    if (requester && contract.unit?.property) {
      await this.propertyAccessService.assertProperty(
        requester,
        contract.unit.property.id,
      );
    }
    if (contract.status !== ContractStatusEnum.ACTIVE) {
      throw new BadRequestException(
        'Only an active contract can be terminated',
      );
    }
    contract.status = ContractStatusEnum.TERMINATED;
    return this.contractRepository.save(contract);
  }

  async cancel(id: string, requester?: User): Promise<Contract> {
    const contract = await this.findOne(id);
    if (requester && contract.unit?.property) {
      await this.propertyAccessService.assertProperty(
        requester,
        contract.unit.property.id,
      );
    }
    if (
      ![ContractStatusEnum.DRAFT, ContractStatusEnum.ACTIVE].includes(
        contract.status,
      )
    ) {
      throw new BadRequestException(
        'Contract cannot be cancelled from its current status',
      );
    }
    contract.status = ContractStatusEnum.CANCELLED;
    return this.contractRepository.save(contract);
  }

  async remove(id: string): Promise<boolean> {
    const contract = await this.findOne(id);
    if (
      ![ContractStatusEnum.DRAFT, ContractStatusEnum.CANCELLED].includes(
        contract.status,
      )
    ) {
      throw new BadRequestException(
        'Only a draft or cancelled contract can be deleted',
      );
    }
    const result = await this.contractRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Contract not found');
    }
    return true;
  }
}
