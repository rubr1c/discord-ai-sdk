import type { Logger, LogLevel, Span } from '@/core/types';
import { BaseLogger } from './base-logger';
import type { Guild } from 'discord.js';

export class CompositeLogger extends BaseLogger {
  private loggers: Logger[];

  constructor(loggers: Logger[], level: LogLevel = 'info') {
    super(level);
    this.loggers = loggers;
  }

  /**
   * Sets the guild context for all audit loggers in the composite logger.
   * @param guild - The guild to set for audit loggers.
   */
  public setGuild(guild: Guild): void {
    this.loggers.forEach((logger) => {
      // Check if the logger has a setGuild method (AuditLogger)
      if (logger.setGuild) {
        logger.setGuild(guild);
      }
    });
  }

  debug(msg: string, meta?: unknown) {
    this.loggers.forEach((l) => l.debug(msg, meta));
  }

  info(msg: string, meta?: unknown) {
    this.loggers.forEach((l) => l.info(msg, meta));
  }

  warn(msg: string, meta?: unknown) {
    this.loggers.forEach((l) => l.warn(msg, meta));
  }

  error(msg: string | Error, meta?: unknown) {
    this.loggers.forEach((l) => l.error(msg, meta));
  }

  override enterSpan(span: Span): void {
    super.enterSpan(span);
    this.loggers.forEach((l) => l.enterSpan(span));
  }

  override exitSpan(): void {
    super.exitSpan();
    this.loggers.forEach((l) => l.exitSpan());
  }
}
