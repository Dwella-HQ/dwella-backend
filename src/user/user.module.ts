import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { KYC } from './entities/kyc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, KYC]), RbacModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
