import type { Logger, LogLevel, Span } from '@/core/types';

import { LOG_LEVEL_ORDER } from '@/core/types';

export abstract class BaseLogger implements Logger {
  public level: LogLevel;
  private spans: Span[] = [];

  constructor(level: LogLevel = 'info') {
    this.level = (process.env.LOG_LEVEL as LogLevel) || level;
  }

  shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[this.level];
  }

  getTimestamp(): string {
    return new Date().toISOString();
  }

  formatSpanInfo(): string {
    let res = '';
    for (const span of this.spans) {
      res += span.name;
      if (typeof span.meta === 'object') {
        const obj = span.meta as Record<string, unknown>;
        const fields = Object.entries(obj)
          .map(([key, value]) => `${key}=${value}`)
          .join('\n');
        res += fields;
      } else {
        res += span.meta;
      }
      res += '|';
    }
    return res;
  }

  formatPrefix(level: LogLevel): string {
    return `${level.toUpperCase()} ${this.getTimestamp()} ${this.formatSpanInfo()}`;
  }

  enterSpan(span: Span): void {
    this.spans.push(span);
  }

  exitSpan(): void {
    this.spans.pop();
  }

  abstract debug(message: string, meta?: unknown): void | Promise<void>;
  abstract info(message: string, meta?: unknown): void | Promise<void>;
  abstract warn(message: string, meta?: unknown): void | Promise<void>;
  abstract error(message: string | Error, meta?: unknown): void | Promise<void>;
}
