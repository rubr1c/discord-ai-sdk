import type { Logger, Safety } from '@/core/types';
import { SAFETY } from '@/core/types';
import type { RequestContext } from '@/core/types';
import { ConsoleLogger } from '@/core/utils/logger/console-logger';
import type { Guild } from 'discord.js';
import type { CompositeLogger } from '@/core/utils/logger/composite-logger';
import type { ToolFactory } from '@/tools/types';

/**
 * Tool registry properties.
 */
export interface ToolRegistryProps<
  TInitialTools extends Record<string, ToolFactory> = Record<string, ToolFactory>,
> {
  /** The tools to register. */
  tools?: TInitialTools;

  /** The logger. */
  logger?: Logger | CompositeLogger;

  /** The safety mode cap. function or string @default 'high' */
  safetyModeCap?: ((guild: Guild) => Promise<Safety>) | Safety;
}

export class ToolRegistry<
  TInitialTools extends Record<string, ToolFactory> = Record<string, ToolFactory>,
> {
  private tools: Record<string, ToolFactory>;
  private safetyModeCap: ((guild: Guild) => Promise<Safety>) | Safety = 'high';
  public logger: Logger | CompositeLogger;

  /**
   * Creates a tool registry.
   * @param options - The options for the tool registry.
   * @example
   * const toolRegistry = new ToolRegistry({
   *   tools: {...discordApiTools, ...customTools},
   *   logger: new ConsoleLogger(),
   * });
   */
  constructor({ tools, logger, safetyModeCap }: ToolRegistryProps<TInitialTools> = {}) {
    this.tools = (tools ?? {}) as TInitialTools;
    this.logger = logger ?? new ConsoleLogger();
    if (safetyModeCap) this.safetyModeCap = safetyModeCap;
  }

  /**
   * Adds a tool to the registry.
   * @param name - The name of the tool.
   * @param tool - The tool to add.
   * @param overwrite - Whether to overwrite the tool if it already exists. @default false
   */
  public addTool(name: string, tool: ToolFactory, overwrite = false): void {
    if (!overwrite && this.hasTool(name)) {
      throw new Error(`Tool "${name}" already exists`);
    }
    this.tools[name] = tool;
    this.logger.info({ message: 'ToolRegistry.addTool', meta: { name } });
  }

  /**
   * Removes a tool from the registry.
   * @param name - The name of the tool.
   * @returns True if the tool was removed, false otherwise.
   */
  public removeTool(name: keyof TInitialTools | (string & {})): boolean {
    const toolName = name as string;
    if (this.hasTool(toolName)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.tools[toolName];
      this.logger.info({ message: 'ToolRegistry.removeTool', meta: { name: toolName } });
      return true;
    }
    return false;
  }

  /**
   * Lists all the tools in the registry.
   * @returns The list of tools.
   */
  public listTools(): string[] {
    return Object.keys(this.tools);
  }

  /**
   * Checks if a tool exists in the registry.
   * @param name - The name of the tool.
   * @returns True if the tool exists, false otherwise.
   */
  public hasTool(name: string): boolean {
    return name in this.tools;
  }

  /**
   * Gets a tool from the registry.
   * @param name - The name of the tool.
   * @returns The tool.
   */
  public getTool(name: string): ToolFactory | undefined {
    return this.tools[name];
  }

  /**
   * Gets all the available tools in the registry.
   * @param ctx - The context.
   * @returns The list of available tools.
   */
  public async getAllAvailableTools(
    ctx: RequestContext,
  ): Promise<Readonly<Record<string, ToolFactory>>> {
    const safetyMode =
      typeof this.safetyModeCap === 'function'
        ? await this.safetyModeCap(ctx.guild)
        : this.safetyModeCap;

    if (safetyMode === 'high') {
      this.logger.debug({
        message: 'ToolRegistry.getAllAvailableTools: high safety, returning all',
      });
      return this.getAllTools();
    }

    const currentSafetyLevel = SAFETY[safetyMode];
    const availableTools: Record<string, ToolFactory> = {};

    for (const [toolName, tool] of Object.entries(this.tools)) {
      const toolSafetyLevel = SAFETY[tool.safetyLevel];
      if (toolSafetyLevel <= currentSafetyLevel) {
        availableTools[toolName] = tool;
      }
    }

    this.logger.debug({
      message: 'ToolRegistry.getAllAvailableTools: filtered',
      meta: {
        count: Object.keys(availableTools).length,
      },
    });
    return Object.freeze(availableTools);
  }

  /**
   * Gets all the tools in the registry.
   * @returns The list of tools.
   */
  public getAllTools(): Readonly<Record<string, ToolFactory>> {
    let allTools = { ...this.tools };
    this.logger.debug({
      message: 'ToolRegistry.getAllTools',
      meta: { count: Object.keys(allTools).length },
    });

    return Object.freeze(allTools);
  }

  /**
   * Sets the safety mode cap or function to set the safety mode cap.
   * @param cap - The safety mode cap or function.
   */
  public setSafetyModeCap(cap: ((guild: Guild) => Promise<Safety>) | Safety) {
    this.safetyModeCap = cap;
    this.logger.info({ message: 'ToolRegistry.setSafetyModeCap' });
  }
}
