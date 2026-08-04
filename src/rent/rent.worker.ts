/* eslint-disable @typescript-eslint/no-unused-vars */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { TenantService } from 'src/tenant/tenant.service';
import {
  JOB_NAMES,
  LateFeeTypeEnum,
  MonthlyRentGracePeriodEnum,
  QuarterlyRentGracePeriodEnum,
  RentFrequencyEnum,
  RentStatusEnum,
  YearlyRentGracePeriodEnum,
} from 'src/utils/constants';
import { Rent } from './entity/rent.entity';
import { LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { addMonths, addWeeks, addYears } from 'date-fns';
import { PropertyService } from 'src/property/property.service';

@Processor(JOB_NAMES.RENT_MANAGEMENT_JOB)
export class RentWorker extends WorkerHost {
  constructor(
    private readonly tenantService: TenantService,
    private readonly propertyService: PropertyService,
    @InjectRepository(Rent) private readonly rentRepository: Repository<Rent>,
  ) {
    super();
  }

  async process(job: Job<any, any, string>) {
    switch (job.name) {
      case 'rent-creation': {
        const leases = await this.tenantService.queryLease({
          active: true,
        });
        for (const lease of leases) {
          // Check if rent is due for the lease and create rent record if necessary
          const activeRent = await this.rentRepository.findOne({
            where: {
              leaseId: lease.id,
              endDate: MoreThanOrEqual(new Date()),
            },
          });
          const propertySettings =
            await this.propertyService.getPropertySettings(
              lease.unit!.property.id,
            );
          if (!activeRent) {
            let endDate: Date;
            let dueDate: Date;
            switch (lease.rentFrequency) {
              case RentFrequencyEnum.MONTHLY: {
                endDate = addMonths(new Date(), 1);
                dueDate = endDate;
                const gracePeriod =
                  propertySettings.gracePeriodPeriods
                    .monthlyRentDueDateGracePeriod;
                if (gracePeriod == MonthlyRentGracePeriodEnum.ONE_WEEK) {
                  dueDate = addWeeks(dueDate, 1);
                }
                if (gracePeriod == MonthlyRentGracePeriodEnum.TWO_WEEKS) {
                  dueDate = addWeeks(dueDate, 2);
                }
                break;
              }
              case RentFrequencyEnum.QUARTERLY: {
                endDate = addMonths(new Date(), 3);
                dueDate = endDate;
                const quarterlyGracePeriod =
                  propertySettings.gracePeriodPeriods
                    .quarterlyRentDueDateGracePeriod;
                if (
                  quarterlyGracePeriod == QuarterlyRentGracePeriodEnum.ONE_WEEK
                ) {
                  dueDate = addWeeks(dueDate, 1);
                }
                if (
                  quarterlyGracePeriod == QuarterlyRentGracePeriodEnum.TWO_WEEKS
                ) {
                  dueDate = addWeeks(dueDate, 2);
                }
                if (
                  quarterlyGracePeriod ==
                  QuarterlyRentGracePeriodEnum.THREE_WEEKS
                ) {
                  dueDate = addWeeks(dueDate, 3);
                }
                if (
                  quarterlyGracePeriod == QuarterlyRentGracePeriodEnum.ONE_MONTH
                ) {
                  dueDate = addMonths(dueDate, 1);
                }
                if (
                  quarterlyGracePeriod ==
                  QuarterlyRentGracePeriodEnum.FIVE_WEEKS
                ) {
                  dueDate = addWeeks(dueDate, 5);
                }
                if (
                  quarterlyGracePeriod == QuarterlyRentGracePeriodEnum.SIX_WEEKS
                ) {
                  dueDate = addWeeks(dueDate, 6);
                }
                break;
              }
              case RentFrequencyEnum.YEARLY: {
                endDate = addYears(new Date(), 1);
                dueDate = endDate;
                const yearlyGracePeriod =
                  propertySettings.gracePeriodPeriods
                    .yearlyRentDueDateGracePeriod;
                if (yearlyGracePeriod == YearlyRentGracePeriodEnum.ONE_MONTH) {
                  dueDate = addMonths(dueDate, 1);
                }
                if (yearlyGracePeriod == YearlyRentGracePeriodEnum.TWO_MONTHS) {
                  dueDate = addMonths(dueDate, 2);
                }
                if (
                  yearlyGracePeriod == YearlyRentGracePeriodEnum.THREE_MONTHS
                ) {
                  dueDate = addMonths(dueDate, 3);
                }
                if (
                  yearlyGracePeriod == YearlyRentGracePeriodEnum.FOUR_MONTHS
                ) {
                  dueDate = addMonths(dueDate, 4);
                }
                if (
                  yearlyGracePeriod == YearlyRentGracePeriodEnum.FIVE_MONTHS
                ) {
                  dueDate = addMonths(dueDate, 5);
                }
                if (yearlyGracePeriod == YearlyRentGracePeriodEnum.SIX_MONTHS) {
                  dueDate = addMonths(dueDate, 6);
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
            const newRent = this.rentRepository.create({
              leaseId: lease.id,
              amount: lease.rentAmount,
              totalAmount: lease.rentAmount,
              status: RentStatusEnum.PENDING,
              paymentDate: new Date(),
              startDate: new Date(),
              endDate: endDate,
              dueDate: dueDate,
            });
            //TODO  Notify tenant about new rent
            await this.rentRepository.save(newRent);
          }
        }
        return;
      }
      case 'rent-due-date-update': {
        const rents = await this.rentRepository.find({
          where: {
            dueDate: MoreThanOrEqual(new Date()),
            status: RentStatusEnum.PENDING,
          },
          relations: {
            lease: {
              unit: {
                property: true,
              },
              tenant: true,
            },
          },
        });
        for (const rent of rents) {
          rent.status = RentStatusEnum.OVERDUE;
          const propertySettings =
            await this.propertyService.getPropertySettings(
              rent.lease.unit!.property.id,
            );
          let lateFee = 0;
          if (
            propertySettings.lateFeeSettings.lateFeeType ===
            LateFeeTypeEnum.FIXED
          ) {
            lateFee = propertySettings.lateFeeSettings.lateFeeAmount;
          } else if (
            propertySettings.lateFeeSettings.lateFeeType ===
            LateFeeTypeEnum.PERCENTAGE
          ) {
            lateFee =
              (rent.amount * propertySettings.lateFeeSettings.lateFeeAmount) /
              100;
          }
          rent.lateFee = lateFee;
          rent.totalAmount = Number(rent.amount) + lateFee;
          await this.rentRepository.save(rent);
          //TODO Notify tenant about overdue rent
        }
        return;
      }
      case 'pre-rent-reminder': {
        const date = addWeeks(new Date(), -1);
        const rents = await this.rentRepository.find({
          where: {
            endDate: MoreThanOrEqual(date),
          },
          relations: {
            lease: {
              unit: {
                property: true,
              },
              tenant: true,
            },
          },
        });
        for (const rent of rents) {
          //TODO Notify tenant about upcoming rent due date
        }
        return;
      }
      case 'post-rent-reminder': {
        const rents = await this.rentRepository.find({
          where: {
            startDate: LessThanOrEqual(new Date()),
            status: Not(RentStatusEnum.PAID),
          },
        });
        for (const rent of rents) {
          //TODO Notify tenant about overdue rent
        }
        return;
      }
      default: {
        throw new Error('Unknown job name');
      }
    }
  }
}
