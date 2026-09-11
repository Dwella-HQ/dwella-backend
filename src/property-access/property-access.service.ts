import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Landlord } from 'src/landlord/entities/landlord.entity';
import { Property } from 'src/property/entities/property.entity';
import { Unit } from 'src/property/entities/unit.entity';
import { PropertyManager } from 'src/property-manager/entities/property-manager.entity';
import { Security } from 'src/security/entities/security-property.entity';
import { Lease } from 'src/tenant/entities/lease.entity';
import { User } from 'src/user/entities/user.entity';
import { AdminRoles, USER_ROLES } from 'src/utils/constants';

export type PropertyScopeResult =
  | { kind: 'all' }
  | { kind: 'properties'; propertyIds: Set<string>; unitIds: Set<string> }
  | { kind: 'none' };

@Injectable()
export class PropertyAccessService {
  /** Per-request memoisation of the resolved scope, keyed by the user object. */
  private readonly scopeCache = new WeakMap<
    User,
    Promise<PropertyScopeResult>
  >();

  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
    @InjectRepository(PropertyManager)
    private readonly propertyManagerRepository: Repository<PropertyManager>,
    @InjectRepository(Security)
    private readonly securityRepository: Repository<Security>,
    @InjectRepository(Landlord)
    private readonly landlordRepository: Repository<Landlord>,
  ) {}

  /** Resolve which properties/units a user can touch. */
  getScope(user: User): Promise<PropertyScopeResult> {
    const cached = this.scopeCache.get(user);
    if (cached) return cached;
    const resolved = this.resolveScope(user);
    this.scopeCache.set(user, resolved);
    return resolved;
  }

  private async resolveScope(user: User): Promise<PropertyScopeResult> {
    const role = user?.role?.name;

    if (!role) return { kind: 'none' };
    if (AdminRoles.includes(role)) return { kind: 'all' };

    switch (role) {
      // TODO: scope these once agents / maintenance staff are linked to properties.
      case USER_ROLES.AGENT:
      case USER_ROLES.MAINTENANCE_STAFF:
        return { kind: 'all' };

      case USER_ROLES.LANDLORD: {
        const properties = await this.propertyRepository.find({
          where: { landlord: { user: { id: user.id } } },
          select: { id: true },
        });
        return this.propertyScope(properties.map((property) => property.id));
      }

      case USER_ROLES.PROPERTY_MANAGER: {
        const managers = await this.propertyManagerRepository.find({
          where: { user: { id: user.id } },
          relations: { properties: true },
        });
        const ids = managers.flatMap((manager) =>
          (manager.properties ?? []).map((property) => property.id),
        );
        return this.propertyScope(ids);
      }

      case USER_ROLES.SECURITY: {
        const assignments = await this.securityRepository.find({
          where: { user: { id: user.id } },
          relations: { property: true },
        });
        return this.propertyScope(
          assignments.map((assignment) => assignment.property.id),
        );
      }

      case USER_ROLES.TENANT: {
        const leases = await this.leaseRepository.find({
          where: { tenant: { user: { id: user.id } }, isActive: true },
          relations: { unit: { property: true } },
        });
        const propertyIds: string[] = [];
        const unitIds: string[] = [];
        for (const lease of leases) {
          if (!lease.unit) continue;
          unitIds.push(lease.unit.id);
          if (lease.unit.property) propertyIds.push(lease.unit.property.id);
        }
        return this.propertyScope(propertyIds, unitIds);
      }

      default:
        return { kind: 'none' };
    }
  }

  private propertyScope(
    propertyIds: string[],
    unitIds: string[] = [],
  ): PropertyScopeResult {
    return {
      kind: 'properties',
      propertyIds: new Set(propertyIds),
      unitIds: new Set(unitIds),
    };
  }

  async assertProperty(user: User, propertyId: string): Promise<void> {
    const scope = await this.getScope(user);
    if (scope.kind === 'all') return;
    if (scope.kind === 'properties' && scope.propertyIds.has(propertyId))
      return;
    throw new UnauthorizedException('You do not have access to this property');
  }

  async assertUnit(user: User, unitId: string): Promise<void> {
    const scope = await this.getScope(user);
    if (scope.kind === 'all') return;
    if (scope.kind === 'properties' && scope.unitIds.has(unitId)) return;

    const unit = await this.unitRepository.findOne({
      where: { id: unitId },
      relations: { property: true },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    await this.assertProperty(user, unit.property.id);
  }

  async assertTenant(user: User, tenantId: string): Promise<void> {
    const scope = await this.getScope(user);
    if (scope.kind === 'all') return;

    const leases = await this.leaseRepository.find({
      where: { tenant: { id: tenantId } },
      relations: { tenant: { user: true }, unit: { property: true } },
    });

    if (user?.role?.name === USER_ROLES.TENANT) {
      const ownsTenant = leases.some(
        (lease) => lease.tenant?.user?.id === user.id,
      );
      if (ownsTenant) return;
      throw new UnauthorizedException('You do not have access to this tenant');
    }

    if (scope.kind === 'properties') {
      const overlaps = leases.some((lease) =>
        lease.unit?.property
          ? scope.propertyIds.has(lease.unit.property.id)
          : false,
      );
      if (overlaps) return;
    }
    throw new UnauthorizedException('You do not have access to this tenant');
  }

  async assertLandlord(user: User, landlordId: string): Promise<void> {
    const scope = await this.getScope(user);
    if (scope.kind === 'all') return;

    if (user?.role?.name === USER_ROLES.LANDLORD) {
      const landlord = await this.landlordRepository.findOne({
        where: { id: landlordId },
        relations: { user: true },
      });
      if (landlord?.user?.id === user.id) return;
    }
    throw new UnauthorizedException('You do not have access to this landlord');
  }

  /** `'all'` for admins/bypass roles, otherwise the concrete list of ids. */
  async getAccessiblePropertyIds(user: User): Promise<string[] | 'all'> {
    const scope = await this.getScope(user);
    if (scope.kind === 'all') return 'all';
    if (scope.kind === 'none') return [];
    return [...scope.propertyIds];
  }

  /** Narrow a list of rows to the ones whose property the user can access. */
  async filterByProperty<T>(
    user: User,
    rows: T[],
    pick: (row: T) => string | undefined | null,
  ): Promise<T[]> {
    const scope = await this.getScope(user);
    if (scope.kind === 'all') return rows;
    if (scope.kind === 'none') return [];
    return rows.filter((row) => {
      const id = pick(row);
      return id ? scope.propertyIds.has(id) : false;
    });
  }
}
