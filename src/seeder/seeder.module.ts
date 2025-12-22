import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import { RbacModule } from 'src/rbac/rbac.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [RbacModule, UserModule],
  controllers: [SeederController],
  providers: [SeederService],
})
export class SeederModule {}
