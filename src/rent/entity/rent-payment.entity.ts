import { Rent } from 'src/rent/entity/rent.entity';
import { CurrenciesEnum, PaymentMethodEnum } from 'src/utils/constants';
import { ColumnNumericTransformer } from 'src/utils/misc';
import { TransferUserDetails } from 'src/utils/shared.dto';
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

@Entity()
export class RentPayment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({
    type: 'text',
  })
  currency: CurrenciesEnum;

  @Column({
    type: 'text',
    nullable: true,
  })
  paymentMethod: PaymentMethodEnum;

  @Column({ default: '' })
  narration: string;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  senderDetails: TransferUserDetails;

  @OneToOne(() => Rent, (rent) => rent.payment)
  rent: Relation<Rent>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
