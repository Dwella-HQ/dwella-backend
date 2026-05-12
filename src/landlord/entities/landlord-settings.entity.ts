import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Landlord } from './landlord.entity';
import {
  CurrenciesEnum,
  LanguagesEnum,
  LateFeeTypeEnum,
  MonthlyRentGracePeriodEnum,
  NotificationChannelEnum,
  QuarterlyRentGracePeriodEnum,
  YearlyRentGracePeriodEnum,
} from 'src/utils/constants';

@Entity()
export class LandlordSettings extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Landlord, (landlord) => landlord.settings)
  landlord?: Relation<Landlord>;

  @Column('simple-json', {
    default: {
      paymentNotifications: [NotificationChannelEnum.EMAIL_NOTIFICATION],
      maintenanceRequestNotifications: [
        NotificationChannelEnum.EMAIL_NOTIFICATION,
      ],
      overDueNotifications: [NotificationChannelEnum.EMAIL_NOTIFICATION],
      weeklyReportsNotifications: [NotificationChannelEnum.EMAIL_NOTIFICATION],
    },
  })
  notificationPreferences!: {
    paymentNotifications: NotificationChannelEnum[];
    maintenanceRequestNotifications: NotificationChannelEnum[];
    overDueNotifications: NotificationChannelEnum[];
    weeklyReportsNotifications: NotificationChannelEnum[];
  };

  @Column('simple-json', {
    default: {
      defaultCurrency: CurrenciesEnum.NGN,
      defaultLateFeeAmount: 0,
      language: LanguagesEnum.ENGLISH,
    },
  })
  platformPreferences!: {
    defaultCurrency: CurrenciesEnum;
    defaultLateFeeAmount: number;
    language: LanguagesEnum;
  };

  @Column('simple-json', {
    default: {
      monthlyRentDueDateGracePeriod: MonthlyRentGracePeriodEnum.NO_GRACE_PERIOD,
      quarterlyRentDueDateGracePeriod:
        QuarterlyRentGracePeriodEnum.NO_GRACE_PERIOD,
      yearlyRentDueDateGracePeriod: YearlyRentGracePeriodEnum.NO_GRACE_PERIOD,
    },
  })
  gracePeriodPeriods!: {
    monthlyRentDueDateGracePeriod: MonthlyRentGracePeriodEnum;
    quarterlyRentDueDateGracePeriod: QuarterlyRentGracePeriodEnum;
    yearlyRentDueDateGracePeriod: YearlyRentGracePeriodEnum;
  };

  @Column('simple-json', {
    default: {
      lateFeeAmount: 0,
      lateFeeType: LateFeeTypeEnum.FIXED,
    },
  })
  lateFeeSettings!: {
    lateFeeAmount: number;
    lateFeeType: LateFeeTypeEnum;
  };

  @Column('simple-json')
  bankAccount!: {
    accountName: string;
    accountCode: string;
    bankName: string;
    bvn: string;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
