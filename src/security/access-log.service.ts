import { Injectable, Logger } from '@nestjs/common';
import { appendFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export interface AccessLogEntry {
  timestamp: string;
  event: string;
  name: string;
  code: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitName: string;
  tenantId: string;
  tenantUsername: string;
  securityId: string;
  message: string;
}

export interface AccessLogQuery {
  propertyId?: string;
  tenantId?: string;
  /** Free-text search matched against the raw log line (case-insensitive). */
  q?: string;
}

@Injectable()
export class AccessLogService {
  private readonly logger = new Logger(AccessLogService.name);
  private readonly logDir = join(process.cwd(), 'logs');
  private readonly logFile = join(this.logDir, 'access-logs.log');

  /** Append a single access event as one JSON line to the access log file. */
  async record(
    entry: Omit<AccessLogEntry, 'timestamp' | 'event'> &
      Partial<Pick<AccessLogEntry, 'timestamp' | 'event'>>,
  ): Promise<AccessLogEntry> {
    const record: AccessLogEntry = {
      ...entry,
      timestamp: entry.timestamp ?? new Date().toISOString(),
      event: entry.event ?? 'access_code_used',
    };
    try {
      if (!existsSync(this.logDir)) {
        await mkdir(this.logDir, { recursive: true });
      }
      await appendFile(this.logFile, `${JSON.stringify(record)}\n`, 'utf8');
    } catch (error) {
      this.logger.error('Failed to write access log entry', error as Error);
    }
    return record;
  }

  /**
   * Read the access log file and return entries matching the query, newest
   * first. Filtering is done by plain text search over each line so it stays
   * cheap and dependency-free.
   */
  async search(query: AccessLogQuery = {}): Promise<AccessLogEntry[]> {
    let raw: string;
    try {
      raw = await readFile(this.logFile, 'utf8');
    } catch {
      return [];
    }

    const needles: string[] = [];
    if (query.propertyId) needles.push(query.propertyId.toLowerCase());
    if (query.tenantId) needles.push(query.tenantId.toLowerCase());
    if (query.q) needles.push(query.q.toLowerCase());

    const entries: AccessLogEntry[] = [];
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (needles.length) {
        const haystack = trimmed.toLowerCase();
        if (!needles.every((needle) => haystack.includes(needle))) continue;
      }
      try {
        entries.push(JSON.parse(trimmed) as AccessLogEntry);
      } catch {
        this.logger.warn(`Skipping malformed access log line: ${trimmed}`);
      }
    }

    return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
}
