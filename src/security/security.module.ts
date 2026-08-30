import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Property } from 'src/property/entities/property.entity';
import { Unit } from 'src/property/entities/unit.entity';
import { PropertyManager } from 'src/property-manager/entities/property-manager.entity';
import { UserModule } from 'src/user/user.module';
import { AccessCodeLog } from './entities/access-code-log.entity';
import { SecurityProperty } from './entities/security-property.entity';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forFeature([
      Property,
      Unit,
      PropertyManager,
      SecurityProperty,
      AccessCodeLog,
    ]),
  ],
  controllers: [SecurityController],
  providers: [SecurityService],
})
export class SecurityModule {}
