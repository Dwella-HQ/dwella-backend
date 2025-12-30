/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/user/entities/user.entity';
import { LandlordService } from '../landlord.service';
import { AdminRoles, USER_ROLES } from 'src/utils/constants';

@Injectable()
export class LandLordActiveGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly landlordService: LandlordService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      return false;
    }
    if (AdminRoles.includes(user?.role?.name)) {
      return true;
    }

    if (user?.role?.name === USER_ROLES.LANDLORD) {
      const landlord = await this.landlordService.findByUserId(user.id);
      if (landlord && landlord.isActive) {
        return true;
      }
    }
    return false;
  }
}
