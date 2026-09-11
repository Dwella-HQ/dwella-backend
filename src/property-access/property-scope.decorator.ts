import { SetMetadata } from '@nestjs/common';

export type PropertyScopeType = 'property' | 'unit' | 'tenant' | 'landlord';

export interface PropertyScopeOptions {
  /** Route param that carries the resource id. Defaults to `propertyId`. */
  param?: string;
  /** What kind of resource the id points at. Defaults to `property`. */
  type?: PropertyScopeType;
  /** When the param is absent, skip the check instead of throwing a 400. */
  optional?: boolean;
}

export const PROPERTY_SCOPE_KEY = 'property_scope';

/**
 * Marks a route handler (or a whole controller) as scoped to a specific
 * property / unit / tenant / landlord. `PropertyAccessGuard` reads this metadata
 * and enforces that the current user is entitled to that resource, returning 401
 * otherwise.
 */
export const PropertyScope = (options: PropertyScopeOptions = {}) =>
  SetMetadata(PROPERTY_SCOPE_KEY, options);
