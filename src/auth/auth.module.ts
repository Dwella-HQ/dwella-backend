import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JWTStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { RbacModule } from 'src/rbac/rbac.module';

@Global()
@Module({
  imports: [UserModule, RbacModule],
  controllers: [AuthController],
  providers: [AuthService, JWTStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
