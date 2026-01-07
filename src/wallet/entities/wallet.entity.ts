import { Landlord } from 'src/landlord/entities/landlord.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { WalletTransactions } from './wallet-transactions.entity';
import { CurrenciesEnum } from 'src/utils/constants';
import { VBA } from '../vba/entity/vba.entity';
import { Exclude, instanceToPlain } from 'class-transformer';

@Entity()
export class Wallet extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    default: CurrenciesEnum.NGN,
  })
  currency: CurrenciesEnum;

  @ManyToOne(() => Landlord)
  landlord: Relation<Landlord>;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  escrowBalance: number;

  @OneToMany(() => WalletTransactions, (transaction) => transaction.wallet)
  transactions: Relation<WalletTransactions[]>;

  @OneToMany(() => VBA, (vba) => vba.wallet)
  vbas: Relation<VBA[]>;

  @Column()
  bvn: string;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  metadata: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toJSON() {
    return instanceToPlain(this);
  }
}
