import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import ms from 'ms';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Property } from 'src/property/entities/property.entity';
import { Unit } from 'src/property/entities/unit.entity';
import { PropertyManager } from 'src/property-manager/entities/property-manager.entity';
import { UserService } from 'src/user/user.service';
import { USER_ROLES } from 'src/utils/constants';
import { generateNumericToken } from 'src/utils/misc';
import { CreateAccessCodeDto } from './dto/create-access-code.dto';
import { RegisterSecurityDto } from './dto/register-security.dto';
import { AccessCodeLog } from './entities/access-code-log.entity';
import { SecurityProperty } from './entities/security-property.entity';

export interface CachedAccessCode {
  name: string;
  code: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitName: string;
  tenantId: string;
  tenantUsername: string;
}

@Injectable()
export class SecurityService {
  private readonly accessCodeTtl = ms('6h');

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(PropertyManager)
    private readonly propertyManagerRepository: Repository<PropertyManager>,
    @InjectRepository(SecurityProperty)
    private readonly assignmentRepository: Repository<SecurityProperty>,
    @InjectRepository(AccessCodeLog)
    private readonly accessCodeLogRepository: Repository<AccessCodeLog>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async register(dto: RegisterSecurityDto) {
    return this.userService.create({
      phoneNumber: dto.phoneNumber,
      password: dto.password,
      roleName: USER_ROLES.SECURITY,
      fullName: 'Security',
    });
  }

  async registerAndAssign(
    propertyId: string,
    dto: RegisterSecurityDto,
    managerId: string,
  ) {
    const security = await this.register(dto);
    const assignment = await this.assign(propertyId, security.id, managerId);
    return { security, assignment };
  }

  async login(phoneNumber: string, password: string) {
    const user = await this.authService.getAuthenticatedUserByPhone(
      phoneNumber,
      password,
    );
    if (user.role.name !== USER_ROLES.SECURITY) {
      throw new UnauthorizedException('User is not Security');
    }
    const tokens = await this.authService.getTokens(
      user.id,
      user.email || user.phoneNumber!,
    );
    return { user, accessToken: tokens.accessToken };
  }

  async assign(propertyId: string, securityId: string, managerId: string) {
    const property = await this.getProperty(propertyId);
    await this.assertPropertyManager(managerId, propertyId);
    const security = await this.userService.findOne(securityId);
    if (security.role.name !== USER_ROLES.SECURITY) {
      throw new BadRequestException('User is not Security');
    }
    const existing = await this.assignmentRepository.findOne({
      where: { property: { id: propertyId }, security: { id: securityId } },
    });
    if (existing) return existing;
    return this.assignmentRepository.save(
      this.assignmentRepository.create({ security, property }),
    );
  }

  async remove(propertyId: string, securityId: string, managerId: string) {
    await this.getProperty(propertyId);
    await this.assertPropertyManager(managerId, propertyId);
    const result = await this.assignmentRepository.delete({
      property: { id: propertyId },
      security: { id: securityId },
    });
    if (!result.affected)
      throw new NotFoundException('Security assignment not found');
  }

  async listSecurity(propertyId: string, managerId: string) {
    await this.getProperty(propertyId);
    await this.assertPropertyManager(managerId, propertyId);
    return this.assignmentRepository.find({
      where: { property: { id: propertyId } },
      relations: { security: true },
    });
  }

  async generateCode(
    unitId: string,
    tenantId: string,
    dto: CreateAccessCodeDto,
  ) {
    const unit = await this.getUnit(unitId);
    if (!unit.tenant?.user || unit.tenant.user.id !== tenantId) {
      throw new UnauthorizedException('You are not the tenant of this unit');
    }
    const property = unit.property;
    const indexKey = this.propertyIndexKey(property.id);
    const existingKeys =
      (await this.cacheManager.get<string[]>(indexKey)) || [];
    for (const key of existingKeys) {
      const existing = await this.cacheManager.get<CachedAccessCode>(key);
      if (existing?.unitId === unit.id) await this.cacheManager.del(key);
    }
    const code = generateNumericToken(6);
    const cacheKey = this.codeKey(property.id, unit.id, code);
    const value: CachedAccessCode = {
      name: dto.name,
      code,
      propertyId: property.id,
      propertyName: property.name,
      unitId: unit.id,
      unitName: unit.name,
      tenantId,
      tenantUsername: `${unit.tenant.user.fullName}-${tenantId}`,
    };
    await this.cacheManager.set(cacheKey, value, this.accessCodeTtl);
    await this.cacheManager.set(
      indexKey,
      [...existingKeys.filter((key) => key !== cacheKey), cacheKey],
      this.accessCodeTtl,
    );
    return value;
  }

  async getCodes(propertyId: string, securityId: string) {
    await this.assertAssigned(securityId, propertyId);
    const keys =
      (await this.cacheManager.get<string[]>(
        this.propertyIndexKey(propertyId),
      )) || [];
    const codes: CachedAccessCode[] = [];
    for (const key of keys) {
      const value = await this.cacheManager.get<CachedAccessCode>(key);
      if (value) codes.push(value);
    }
    return codes;
  }

  async useCode(propertyId: string, dto: { code: string }, securityId: string) {
    await this.assertAssigned(securityId, propertyId);
    const keys =
      (await this.cacheManager.get<string[]>(
        this.propertyIndexKey(propertyId),
      )) || [];
    const key = keys.find((candidate) => candidate.endsWith(`:${dto.code}`));
    const value = key
      ? await this.cacheManager.get<CachedAccessCode>(key)
      : null;
    if (!key || !value)
      throw new NotFoundException('Access code is invalid or expired');
    await this.accessCodeLogRepository.save(
      this.accessCodeLogRepository.create({
        ...value,
        securityId,
        message: `${value.name} granted access with code ${value.code} at ${new Date().toISOString()} to property: ${value.propertyName}, unit: ${value.unitName} by tenant: ${value.tenantUsername}`,
      }),
    );
    await this.cacheManager.del(key);
    await this.cacheManager.set(
      this.propertyIndexKey(propertyId),
      keys.filter((candidate) => candidate !== key),
      this.accessCodeTtl,
    );
    return value;
  }

  async getUsageLogs(propertyId: string, managerId: string) {
    await this.getProperty(propertyId);
    await this.assertPropertyManager(managerId, propertyId);
    return this.accessCodeLogRepository.find({
      where: { propertyId },
      order: { usedAt: 'DESC' },
    });
  }

  private async getProperty(propertyId: string) {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
      relations: { landlord: { user: true } },
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  private async getUnit(unitId: string) {
    const unit = await this.unitRepository.findOne({
      where: { id: unitId },
      relations: { property: true, tenant: { user: true } },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  private async assertPropertyManager(userId: string, propertyId: string) {
    const property = await this.getProperty(propertyId);
    if (property.landlord.user.id === userId) return;
    const manager = await this.propertyManagerRepository.findOne({
      where: { user: { id: userId }, properties: { id: propertyId } },
    });
    if (!manager)
      throw new UnauthorizedException('You cannot manage this property');
  }

  private async assertAssigned(securityId: string, propertyId: string) {
    const assignment = await this.assignmentRepository.findOne({
      where: { security: { id: securityId }, property: { id: propertyId } },
    });
    if (!assignment)
      throw new UnauthorizedException(
        'Security is not assigned to this property',
      );
  }

  private propertyIndexKey(propertyId: string) {
    return `access-codes:property:${propertyId}`;
  }

  private codeKey(propertyId: string, unitId: string, code: string) {
    return `access-code:${propertyId}:${unitId}:${code}`;
  }
}
