import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { PropertyAccessService } from './property-access.service';
import {
  PROPERTY_SCOPE_KEY,
  PropertyScopeOptions,
} from './property-scope.decorator';

@Injectable()
export class PropertyAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly propertyAccessService: PropertyAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<PropertyScopeOptions>(
      PROPERTY_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!options) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: User }>();
    const user = request.user;
    if (!user) return false;

    const param = options.param ?? 'propertyId';
    const id = request.params?.[param];
    if (!id) {
      if (options.optional) return true;
      throw new BadRequestException(`Missing route parameter: ${param}`);
    }

    switch (options.type ?? 'property') {
      case 'unit':
        await this.propertyAccessService.assertUnit(user, id);
        break;
      case 'tenant':
        await this.propertyAccessService.assertTenant(user, id);
        break;
      case 'landlord':
        await this.propertyAccessService.assertLandlord(user, id);
        break;
      default:
        await this.propertyAccessService.assertProperty(user, id);
    }
    return true;
  }
}
