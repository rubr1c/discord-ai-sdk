import { generateText, stepCountIs, type LanguageModel } from 'ai';
import { type Logger, type RequestContext } from '@/core/types';
import { RateLimiter } from '@/core/rate-limiter';
import { ToolRegistry } from '@/core/tool-registry';
import { PromptBuilder } from '@/core/prompt-builder';
import { AIError } from '@/core/error';
import { discordApiTools } from '@/tools';
import { ConsoleLogger } from '@/core/utils/logger/console-logger';
import type { CompositeLogger } from '@/core/utils/logger/composite-logger';

/**
 * Configuration for the AI engine.
 */
export interface AIEngineProps {
  /** The language model to use. */
  model: LanguageModel;

  /** Prompt builder. @default new PromptBuilder('', false, logger) */
  promptBuilder?: PromptBuilder;

  /** Tool registry. @default new ToolRegistry({ tools: discordApiTools, logger }) */
  toolRegistry?: ToolRegistry;

  /** Rate limiter. @default new RateLimiter({ limitCount: 3, windowMs: 60000, logger }) */
  rateLimiter?: RateLimiter;

  /** Maximum retries (0 disables). @default 2 */
  maxRetries?: number;

  /** Maximum tool steps. @default 5 */
  maxSteps?: number;

  /** Model temperature. @default 0 */
  temperature?: number;

  /** Maximum output tokens. @default 400 */
  maxTokens?: number;

  /** Logger. @default new ConsoleLogger() */
  logger?: Logger | CompositeLogger;
}

/**
 * Result from the language model.
 */
export interface LLMResult {
  text: string;
  toolResults?: {
    toolName: string;
    result: unknown;
  }[];
}

/**
 * Configuration for the AI engine.
 */
export interface AIEngineConfig {
  maxRetries: number;
  maxSteps: number;
  temperature: number;
  maxTokens: number;
}

/**
 * AI engine that orchestrates model calls and Discord tools.
 */
export class AIEngine {
  private model: LanguageModel;
  private promptBuilder: PromptBuilder;
  private toolRegistry: ToolRegistry;
  private rateLimiter: RateLimiter;
  private config: AIEngineConfig;
  public logger: Logger | CompositeLogger;

  /**
   * Creates an AI engine that orchestrates model calls and Discord tools.
   * @param options - Engine configuration.
   * @example
   * const engine = new AIEngine({ model: openai('gpt-4o'), logger: new ConsoleLogger() });
   */
  constructor(options: AIEngineProps) {
    this.model = options.model;
    this.logger = options.logger ?? new ConsoleLogger();
    this.promptBuilder = options.promptBuilder || new PromptBuilder({ logger: this.logger });
    this.toolRegistry =
      options.toolRegistry ||
      new ToolRegistry({
        // Core Discord bot functionality: Essential tools only to reduce lost in the middle problems
        tools: {
          ...discordApiTools.channelTools,
          ...discordApiTools.roleTools,
          getMembers: discordApiTools.memberTools.getMembers,
          getUserId: discordApiTools.memberTools.getUserId,
          getMessages: discordApiTools.messageTools.getMessages,
          sendMessage: discordApiTools.messageTools.sendMessage,
        },
        logger: this.logger,
      });
    this.rateLimiter =
      options.rateLimiter ||
      new RateLimiter({ limitCount: 3, windowMs: 60000, logger: this.logger });

    this.config = {
      maxRetries: options.maxRetries ?? 2,
      maxSteps: options.maxSteps ?? 5,
      temperature: options.temperature ?? 0,
      maxTokens: options.maxTokens ?? 400,
    };
  }

  /**
   * Handles a prompt and returns the response.
   * @param prompt - The prompt to handle.
   * @param ctx - The request context.
   * @param postProcess - Whether to post-process the response.
   * @returns The response.
   * @throws {AIError} If the prompt is rate limited.
   */
  public async handle(prompt: string, ctx: RequestContext, postProcess = true): Promise<string> {
    if (await this.rateLimiter.isRateLimited(ctx)) {
      const err = new AIError('RATE_LIMIT', `User[${ctx.userId}] is rate limited`);
      throw err;
    }

    const res = await this.callModel(prompt, ctx);

    if (postProcess) {
      return this.postProcess(res);
    }
    return res.text;
  }

  /**
   * Calls the model and returns the result.
   * @param prompt - The prompt to handle.
   * @param ctx - The request context.
   * @returns The result.
   * @throws {AIError} If the model call fails.
   */
  public async callModel(prompt: string, ctx: RequestContext): Promise<LLMResult> {
    const prompts = this.promptBuilder.build(prompt, ctx);

    try {
      const result = await generateText({
        model: this.model,
        prompt: prompts.prompt,
        system: prompts.system,
        tools: Object.fromEntries(
          Object.entries(await this.toolRegistry.getAllAvailableTools(ctx)).map(
            ([name, aiTool]) => [name, aiTool.tool({ guild: ctx.guild, logger: this.logger })],
          ),
        ),
        maxRetries: this.config.maxRetries,
        stopWhen: stepCountIs(this.config.maxSteps),
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
      });

      this.logger.info({ message: 'AIEngine.callModel completed', guild: ctx.guild });

      return {
        text: result.text,
        toolResults: result.toolResults?.map((tr) => ({
          toolName: tr.toolName,
          result: tr,
        })),
      };
    } catch (error) {
      this.logger.error({
        message: 'AIEngine.callModel failed',
        error: error as Error,
        guild: ctx.guild,
      });
      throw new AIError(
        'MODEL_ERROR',
        `Model execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Post-processes the result.
   * @param result - The result to post-process.
   * @returns The post-processed result.
   */
  public postProcess(result: LLMResult): string {
    if (result.text && result.text.trim() !== '') {
      return result.text;
    }

    if (result.toolResults && result.toolResults.length > 0) {
      const lines = result.toolResults.map((toolResult) => {
        const summary = this.extractToolRunSummary(toolResult.result);
        return `**${toolResult.toolName}**: ${summary}`;
      });
      return `I've completed the following actions:\n\n${lines.join('\n\n')}`;
    }

    return "I received your request but couldn't generate a proper response. This might be due to a tool execution error or the AI model not calling the appropriate tools. Please try rephrasing your request or check if you have the necessary permissions.";
  }

  /**
   * Extracts the summary of a tool run.
   * @param toolRun - The tool run to extract the summary from.
   * @returns The summary of the tool run.
   */
  private extractToolRunSummary(toolRun: unknown): string {
    if (
      this.isRecord(toolRun) &&
      typeof toolRun.error === 'string' &&
      toolRun.error.trim() !== ''
    ) {
      return `Error - ${toolRun.error}`;
    }

    const nested = this.pickFirst(toolRun, ['result', 'output']);
    if (
      this.isRecord(nested) &&
      typeof nested.summary === 'string' &&
      nested.summary.trim() !== ''
    ) {
      return nested.summary;
    }

    if (typeof nested === 'string' && nested.trim() !== '') return nested;
    if (typeof toolRun === 'string' && toolRun.trim() !== '') return toolRun;

    return 'Tool executed successfully';
  }

  /** @deprecated Use `logger` property instead. */
  public getLogger(): Logger {
    return this.logger;
  }

  public getPromptBuilder(): PromptBuilder {
    return this.promptBuilder;
  }

  public getRateLimiter(): RateLimiter {
    return this.rateLimiter;
  }

  public getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }

  public getModel(): LanguageModel {
    return this.model;
  }

  public getConfig() {
    return this.config;
  }

  /** @deprecated Use `logger` property instead. */
  public setLogger(logger: Logger) {
    this.logger = logger;
  }

  public setPromptBuilder(promptBuilder: PromptBuilder) {
    this.promptBuilder = promptBuilder;
  }

  public setToolRegistry(toolRegistry: ToolRegistry) {
    this.toolRegistry = toolRegistry;
  }

  public setRateLimiter(rateLimiter: RateLimiter) {
    this.rateLimiter = rateLimiter;
  }

  public setModel(model: LanguageModel) {
    this.model = model;
  }

  public setConfig(config: {
    maxRetries?: number;
    maxSteps?: number;
    temperature?: number;
    maxTokens?: number;
  }) {
    this.config = {
      maxRetries: config.maxRetries ?? this.config.maxRetries,
      maxSteps: config.maxSteps ?? this.config.maxSteps,
      temperature: config.temperature ?? this.config.temperature,
      maxTokens: config.maxTokens ?? this.config.maxTokens,
    };
  }

  /**
   * Checks if a value is a record.
   * @param value - The value to check.
   * @returns True if the value is a record, false otherwise.
   */
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  /**
   * Picks the first key from a source.
   * @param source - The source to pick the first key from.
   * @param keys - The keys to pick from the source.
   * @returns The first key from the source.
   */
  private pickFirst(source: unknown, keys: string[]): unknown {
    if (!this.isRecord(source)) return undefined;
    for (const key of keys) {
      if (key in source) return source[key];
    }
    return undefined;
  }
}
