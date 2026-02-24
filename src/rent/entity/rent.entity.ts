import { RentPayment } from 'src/rent/entity/rent-payment.entity';
import { Lease } from 'src/tenant/entities/lease.entity';
import { RentStatusEnum } from 'src/utils/constants';
import { ColumnNumericTransformer } from 'src/utils/misc';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Rent extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lease, (lease) => lease.rents)
  lease: Relation<Lease>;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({ type: 'text' })
  status: RentStatusEnum;

  @OneToOne(() => RentPayment, (rentPayment) => rentPayment.rent)
  payment: Relation<RentPayment>;

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
