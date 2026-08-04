import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rent } from './entity/rent.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import {
  MonthlyRentGracePeriodEnum,
  QuarterlyRentGracePeriodEnum,
  RentFrequencyEnum,
  RentStatusEnum,
  YearlyRentGracePeriodEnum,
} from 'src/utils/constants';
import { CreateRentDto } from './dto/create-rent.dto';
import { TenantService } from 'src/tenant/tenant.service';
import { PropertyService } from 'src/property/property.service';
import { addMonths } from 'date-fns/addMonths';
import { addWeeks } from 'date-fns/addWeeks';
import { addYears } from 'date-fns/addYears';

@Injectable()
export class RentService {
  constructor(
    @InjectRepository(Rent)
    private rentRepository: Repository<Rent>,
    private readonly tenantService: TenantService,
    private readonly propertyService: PropertyService,
  ) {}

  async createRent(createRentDto: CreateRentDto) {
    const [lease] = await this.tenantService.queryLease({
      leaseId: createRentDto.leaseId,
    });
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
        leaseId: lease.id,
        endDate: MoreThanOrEqual(new Date()),
      },
    });

    if (activeRent) {
      throw new BadRequestException('There is an active rent for this period');
    }

    const newRent = this.rentRepository.create({
      leaseId: lease.id,
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
        lease: {
          unit: true,
          tenant: true,
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

  async getRentsByLeaseId(leaseId: string) {
    const rents = await this.rentRepository.find({
      where: {
        leaseId,
      },
      relations: {
        lease: true,
        payments: true,
      },
    });
    return rents;
  }

  async handleRentPayment(id: string) {
    const rent = await this.findOne(id);
    rent.status = RentStatusEnum.PAID;
    await this.rentRepository.save(rent);
    return rent;
  }
}
