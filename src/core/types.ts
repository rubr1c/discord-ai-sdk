import type { Tool } from 'ai';
import type { Guild, GuildMember, APIInteractionGuildMember, GuildBasedChannel } from 'discord.js';

/**
 * Request context.
 */
export interface RequestContext {
  guild: Guild;
  channel: GuildBasedChannel;
  userId: string;
  content: string;
  member: GuildMember | APIInteractionGuildMember | null;
}

/**
 * Safety levels.
 */
export const SAFETY = {
  low: 0,
  mid: 1,
  high: 2,
} as const;

export type Safety = keyof typeof SAFETY;

export interface AITool {
  tool: (guild: Guild) => Tool;
  safetyLevel: Safety;
}

export type BotMode = 'slash' | 'message';

export interface Span {
  name: string;
  meta?: unknown;
}

/**
 * Logger interface for any logger to work with the sdk
 */
export interface Logger {
  level: LogLevel;

  shouldLog(level: LogLevel): boolean;

  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string | Error, meta?: unknown): void;

  enterSpan(span: Span): void;
  exitSpan(): void;

  setGuild?(guild: Guild): void;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export const LOG_LEVEL_ORDER = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
} as const;
