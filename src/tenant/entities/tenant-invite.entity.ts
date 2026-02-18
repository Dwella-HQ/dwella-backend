import {
  INVITE_STATUS,
  RentFrequencyEnum,
  SecurityDepositFrequencyEnum,
} from 'src/utils/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class TenantInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  unitId: string;

  @Column()
  leaseStartDate: Date;

  @Column()
  leaseEndDate: Date;

  @Column('text')
  rentFrequency: RentFrequencyEnum;

  @Column('decimal', { precision: 10, scale: 2 })
  rentAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  securityDeposit: number;

  @Column({ type: 'text' })
  securityDepositFrequency: SecurityDepositFrequencyEnum;

  @Column()
  documentId: string;

  @Column({ type: 'text' })
  status: INVITE_STATUS;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
