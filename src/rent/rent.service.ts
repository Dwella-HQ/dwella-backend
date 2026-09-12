import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rent } from './entity/rent.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import {
  ContractTypeEnum,
  MonthlyRentGracePeriodEnum,
  QuarterlyRentGracePeriodEnum,
  RentFrequencyEnum,
  RentStatusEnum,
  YearlyRentGracePeriodEnum,
} from 'src/utils/constants';
import { CreateRentDto } from './dto/create-rent.dto';
import { ContractService } from 'src/contract/contract.service';
import { Contract } from 'src/contract/entities/contract.entity';
import { PropertyService } from 'src/property/property.service';
import { PropertyAccessService } from 'src/property-access/property-access.service';
import { User } from 'src/user/entities/user.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { addMonths } from 'date-fns/addMonths';
import { addWeeks } from 'date-fns/addWeeks';
import { addYears } from 'date-fns/addYears';

@Injectable()
export class RentService {
  constructor(
    @InjectRepository(Rent)
    private rentRepository: Repository<Rent>,
    private readonly contractService: ContractService,
    private readonly propertyService: PropertyService,
    private readonly propertyAccessService: PropertyAccessService,
  ) {}

  /**
   * A shortlet bills once for the whole stay — this generates that single
   * charge right when the booking is made, bypassing `createRent()`'s
   * monthly-cycle grace-period logic entirely (there's no recurrence to wait for).
   */
  @OnEvent('contract.shortlet.created')
  async handleShortletContractCreated(contract: Contract) {
    const newRent = this.rentRepository.create({
      contractId: contract.id,
      amount: contract.rentAmount,
      totalAmount: contract.rentAmount,
      status: RentStatusEnum.PENDING,
      startDate: contract.startDate,
      endDate: contract.endDate!,
      dueDate: contract.startDate,
    });
    await this.rentRepository.save(newRent);
  }

  async createRent(createRentDto: CreateRentDto, user: User) {
    const [lease] = await this.contractService.queryContract({
      contractId: createRentDto.contractId,
    });
    if (!lease) {
      throw new NotFoundException('Contract not found');
    }
    if (lease.type !== ContractTypeEnum.LEASE) {
      throw new BadRequestException(
        'Rent is not applicable to shortlet contracts',
      );
    }
    if (lease?.unit?.property) {
      await this.propertyAccessService.assertProperty(
        user,
        lease.unit.property.id,
      );
    }
    const propertySettings = await this.propertyService.getPropertySettings(
      lease.unit!.property.id,
    );
    const startDate = createRentDto.startDate || new Date();
    let endDate: Date;
    let dueDate: Date;
    switch (lease.rentFrequency) {
      case RentFrequencyEnum.MONTHLY: {
        if (createRentDto.endDate) {
          endDate = createRentDto.endDate;
        } else {
          endDate = addMonths(new Date(), 1);
        }
        if (createRentDto.dueDate) {
          dueDate = createRentDto.dueDate;
        } else {
          dueDate = endDate;
          const gracePeriod =
            propertySettings.gracePeriodPeriods.monthlyRentDueDateGracePeriod;
          if (gracePeriod == MonthlyRentGracePeriodEnum.ONE_WEEK) {
            dueDate = addWeeks(dueDate, 1);
          }
          if (gracePeriod == MonthlyRentGracePeriodEnum.TWO_WEEKS) {
            dueDate = addWeeks(dueDate, 2);
          }
        }

        break;
      }
      case RentFrequencyEnum.QUARTERLY: {
        if (createRentDto.endDate) {
          endDate = createRentDto.endDate;
        } else {
          endDate = addMonths(new Date(), 3);
        }
        if (createRentDto.dueDate) {
          dueDate = createRentDto.dueDate;
        } else {
          dueDate = endDate;
          const quarterlyGracePeriod =
            propertySettings.gracePeriodPeriods.quarterlyRentDueDateGracePeriod;
          if (quarterlyGracePeriod == QuarterlyRentGracePeriodEnum.ONE_WEEK) {
            dueDate = addWeeks(dueDate, 1);
          }
          if (quarterlyGracePeriod == QuarterlyRentGracePeriodEnum.TWO_WEEKS) {
            dueDate = addWeeks(dueDate, 2);
          }
          if (
            quarterlyGracePeriod == QuarterlyRentGracePeriodEnum.THREE_WEEKS
          ) {
            dueDate = addWeeks(dueDate, 3);
          }
          if (quarterlyGracePeriod == QuarterlyRentGracePeriodEnum.ONE_MONTH) {
            dueDate = addMonths(dueDate, 1);
          }
          if (quarterlyGracePeriod == QuarterlyRentGracePeriodEnum.FIVE_WEEKS) {
            dueDate = addWeeks(dueDate, 5);
          }
          if (quarterlyGracePeriod == QuarterlyRentGracePeriodEnum.SIX_WEEKS) {
            dueDate = addWeeks(dueDate, 6);
          }
        }
        break;
      }
      case RentFrequencyEnum.YEARLY: {
        if (createRentDto.endDate) {
          endDate = createRentDto.endDate;
        } else {
          endDate = addYears(new Date(), 1);
        }
        if (createRentDto.dueDate) {
          dueDate = createRentDto.dueDate;
        } else {
          dueDate = endDate;
          const yearlyGracePeriod =
            propertySettings.gracePeriodPeriods.yearlyRentDueDateGracePeriod;
          if (yearlyGracePeriod == YearlyRentGracePeriodEnum.ONE_MONTH) {
            dueDate = addMonths(dueDate, 1);
          }
          if (yearlyGracePeriod == YearlyRentGracePeriodEnum.TWO_MONTHS) {
            dueDate = addMonths(dueDate, 2);
          }
          if (yearlyGracePeriod == YearlyRentGracePeriodEnum.THREE_MONTHS) {
            dueDate = addMonths(dueDate, 3);
          }
          if (yearlyGracePeriod == YearlyRentGracePeriodEnum.FOUR_MONTHS) {
            dueDate = addMonths(dueDate, 4);
          }
          if (yearlyGracePeriod == YearlyRentGracePeriodEnum.FIVE_MONTHS) {
            dueDate = addMonths(dueDate, 5);
          }
          if (yearlyGracePeriod == YearlyRentGracePeriodEnum.SIX_MONTHS) {
            dueDate = addMonths(dueDate, 6);
          }
        }

        break;
      }
      //   case RentFrequencyEnum.BIWEEKLY:
      //     endDate = addWeeks(new Date(), 2);
      //     dueDate = endDate;
      //     const biweeklyGracePeriod =
      //       propertySettings.gracePeriodPeriods
      //         .;
      //     break;
      //   case RentFrequencyEnum.WEEKLY:
      //     endDate = addWeeks(new Date(), 1);
      //     break;
      default:
        endDate = addMonths(new Date(), 1);
        dueDate = endDate;
    }
    const activeRent = await this.rentRepository.findOne({
      where: {
        contractId: lease.id,
        endDate: MoreThanOrEqual(new Date()),
      },
    });

    if (activeRent) {
      throw new BadRequestException('There is an active rent for this period');
    }

    const newRent = this.rentRepository.create({
      contractId: lease.id,
      amount: lease.rentAmount,
      totalAmount: createRentDto.amount || lease.rentAmount,
      status: RentStatusEnum.PENDING,
      startDate: startDate,
      endDate: endDate,
      dueDate: dueDate,
    });
    //TODO  Notify tenant about new rent
    return await this.rentRepository.save(newRent);
  }

  async findOne(id: string) {
    const rent = await this.rentRepository.findOne({
      where: { id },
      relations: {
        contract: {
          unit: { property: true },
          tenant: true,
          guest: true,
        },
      },
      relationLoadStrategy: 'query',
    });
    if (!rent) {
      throw new NotFoundException('Rent not found');
    }
    return rent;
  }

  async findAll() {
    const rents = await this.rentRepository.find();
    return rents;
  }

  async getRentsByContractId(contractId: string, user: User) {
    const [contract] = await this.contractService.queryContract({
      contractId,
    });
    if (contract?.unit?.property) {
      await this.propertyAccessService.assertProperty(
        user,
        contract.unit.property.id,
      );
    }
    const rents = await this.rentRepository.find({
      where: {
        contractId,
      },
      relations: {
        contract: true,
        payments: true,
      },
    });
    return rents;
  }

  async handleRentPayment(id: string, user?: User) {
    const rent = await this.findOne(id);
    if (user && rent.contract?.unit?.property) {
      await this.propertyAccessService.assertProperty(
        user,
        rent.contract.unit.property.id,
      );
    }
    rent.status = RentStatusEnum.PAID;
    await this.rentRepository.save(rent);
    return rent;
  }
}
