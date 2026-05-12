import type { Logger, Safety } from '@/core/types';
import type { Tool } from 'ai';
import type { Guild } from 'discord.js';
import type { CompositeLogger } from '@/core/utils/logger/composite-logger';

/**
 * The result of a tool.
 * @param T - The type of the data.
 */
export interface ToolResult<T = unknown> {
  summary: string;
  data?: T;
}

/**
 * The properties of a tool factory.
 */
export interface ToolFactoryProps {
  guild: Guild;

  /**
   * The logger to be used in the tool.
   */
  logger?: Logger | CompositeLogger;
}

/**
 * The properties of a tool factory.
 */
export interface ToolFactory {
  /**
   * function that passes the guild and logger to the tool.
   */
  tool: (props: ToolFactoryProps) => Tool;

  /**
   * The safety level of the tool.
   */
  safetyLevel: Safety;
}
