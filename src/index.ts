export { AIEngine } from '@/core/ai-engine';
export { DiscordRouter } from '@/core/discord-router';
export { PromptBuilder } from '@/core/prompt-builder';
export { RateLimiter } from '@/core/rate-limiter';
export { ToolRegistry } from '@/core/tool-registry';
export { ConsoleLogger } from '@/core/utils/logger/console-logger';
export { AuditLogger } from '@/core/utils/logger/audit-logger';
export { CompositeLogger } from '@/core/utils/logger/composite-logger';
export type { ToolRegistryProps } from '@/core/tool-registry';
export { AIError, ErrorReason } from '@/core/error';

export type { RequestContext, Safety, BotMode, Logger } from '@/core/types';
export { SAFETY } from '@/core/types';

export type { DiscordRouterProps } from '@/core/discord-router';

export type { RateLimitOpts, RateLimitFn } from '@/core/rate-limiter';

export { discordApiTools } from '@/tools';
export type { ToolResult, ToolFactory, ToolFactoryProps } from '@/tools/types';
