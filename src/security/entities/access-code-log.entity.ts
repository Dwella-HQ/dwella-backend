import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity()
export class AccessCodeLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ length: 6 })
  code!: string;

  @Column()
  propertyId!: string;

  @Column()
  propertyName!: string;

  @Column()
  unitId!: string;

  @Column()
  unitName!: string;

  @Column()
  tenantId!: string;

  @Column()
  tenantUsername!: string;

  @Column()
  securityId!: string;

  @Column()
  message!: string;

  @CreateDateColumn()
  usedAt!: Date;
}
