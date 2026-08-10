import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface CurrentDeviceInfo {
  ip: string;
  userAgent: string;
  device: string;
  location: string;
}

const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers['x-forwarded-for'];

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0].split(',')[0].trim();
  }

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  return request.ip || request.socket.remoteAddress || 'unknown';
};

const getUserAgent = (request: Request): string => {
  return request.get('user-agent') || 'unknown';
};

const getDeviceSummary = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();

  const os = ua.includes('android')
    ? 'Android'
    : ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')
      ? 'iOS'
      : ua.includes('mac os x') || ua.includes('macintosh')
        ? 'macOS'
        : ua.includes('windows')
          ? 'Windows'
          : ua.includes('linux')
            ? 'Linux'
            : 'Unknown OS';

  const browser = ua.includes('edg/')
    ? 'Edge'
    : ua.includes('chrome/')
      ? 'Chrome'
      : ua.includes('safari/') && !ua.includes('chrome/')
        ? 'Safari'
        : ua.includes('firefox/')
          ? 'Firefox'
          : 'Unknown Browser';

  const type = /mobile|iphone|android/.test(ua)
    ? 'Mobile'
    : /ipad|tablet/.test(ua)
      ? 'Tablet'
      : 'Desktop';

  return `${browser} on ${os} (${type})`;
};

const getLocationSummary = (request: Request): string => {
  const city = request.get('x-vercel-ip-city') || request.get('cf-ipcity');
  const region =
    request.get('x-vercel-ip-country-region') || request.get('cf-region');
  const country =
    request.get('x-vercel-ip-country') || request.get('cf-ipcountry');

  const locationParts = [city || '', region || '', country || '']
    .map((value) => value.trim())
    .filter(Boolean);

  return locationParts.length > 0
    ? locationParts.join(', ')
    : 'Unknown location';
};

export const CurrentDevice = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CurrentDeviceInfo => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const ip = getClientIp(request);
    const userAgent = getUserAgent(request);

    return {
      ip,
      userAgent,
      device: getDeviceSummary(userAgent),
      location: getLocationSummary(request),
    };
  },
);
