import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Unit } from './unit.entity';
import { UnitPricingDto } from 'src/utils/shared.dto';

@Entity()
export class RentOffering {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  gracePeriod!: number;

  @Column()
  securityDeposit!: number;

  @Column({ type: 'json', nullable: true })
  pricing?: UnitPricingDto[];

  @OneToOne(() => Unit, (unit) => unit.rentOffering, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  unit!: Relation<Unit>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
