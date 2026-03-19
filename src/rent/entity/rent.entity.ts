import { RentPayment } from 'src/rent-payment/entities/rent-payment.entity';
import { Lease } from 'src/tenant/entities/lease.entity';
import { CurrenciesEnum, RentStatusEnum } from 'src/utils/constants';
import { ColumnNumericTransformer } from 'src/utils/misc';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Rent extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @JoinColumn({ name: 'leaseId' })
  @ManyToOne(() => Lease, (lease) => lease.rents)
  lease: Relation<Lease>;

  @Column()
  leaseId: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: 0,
  })
  lateFee: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: 0,
  })
  totalAmount: number;

  @Column({ type: 'text', default: CurrenciesEnum.NGN })
  currency: string;

  @Column({ type: 'text', default: RentStatusEnum.PENDING })
  status: RentStatusEnum;

  @OneToMany(() => RentPayment, (rentPayment) => rentPayment.rent)
  payments: Relation<RentPayment[]>;

  @Column()
  paymentDate: Date;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  dueDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
