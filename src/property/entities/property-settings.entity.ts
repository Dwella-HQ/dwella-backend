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
import { Property } from './property.entity';
import {
  LateFeeTypeEnum,
  MonthlyRentGracePeriodEnum,
  QuarterlyRentGracePeriodEnum,
  YearlyRentGracePeriodEnum,
} from 'src/utils/constants';

@Entity()
export class PropertySettings extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Property, (property) => property.settings)
  property: Relation<Property>;

  @Column('simple-json', {
    default: {
      monthlyRentDueDateGracePeriod: MonthlyRentGracePeriodEnum.NO_GRACE_PERIOD,
      quarterlyRentDueDateGracePeriod:
        QuarterlyRentGracePeriodEnum.NO_GRACE_PERIOD,
      yearlyRentDueDateGracePeriod: YearlyRentGracePeriodEnum.NO_GRACE_PERIOD,
    },
  })
  gracePeriodPeriods: {
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
  lateFeeSettings: {
    lateFeeAmount: number;
    lateFeeType: LateFeeTypeEnum;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
