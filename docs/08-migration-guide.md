# Migration Guide (vNext)

This guide explains recent breaking or notable changes so you can update quickly.

## discordApiTools split into groups

- Previous: a flat `discordApiTools` object.
- Now: grouped by domain: `channelTools`, `categoryTools`, `roleTools`, `memberTools`, `messageTools`, `threadTools`, `reactionTools`, `vcTools`, `serverTools`.

How to opt-in selectively:

```ts
import { ToolRegistry, discordApiTools } from 'discord-ai-sdk';

const registry = new ToolRegistry({
  tools: {
    ...discordApiTools.channelTools,
    ...discordApiTools.messageTools,
  },
});
```

The `AIEngine` default now registers a minimal set by default (channels, roles, and selected member/message tools) to reduce model distraction. Supply your own `ToolRegistry` if you need more.

## Tool shape: ToolFactory with object params

- Previous: tools often shown as simple functions taking a `Guild` directly.
- Now: each tool is exported as a `ToolFactory` with shape `{ tool: ({ guild, logger }) => aiTool, safetyLevel }`.

No change to how you call tools from the model perspective; the engine binds `{ guild, logger }` internally.

Custom tool example:

```ts
import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

export const myCustomTool: ToolFactory = {
  safetyLevel: 'low',
  tool: ({ guild, logger }) =>
    tool({
      description: 'demo',
      inputSchema: z.object({ name: z.string().min(1) }),
      execute: async ({ name }): Promise<ToolResult> => {
        logger.info({ message: 'myCustomTool.execute', guild, meta: { name } });
        return { summary: `Hello ${name}` };
      },
    }),
};
```

## Logger updates: object-style params and new loggers

- `ConsoleLogger`, `AuditLogger`, and `CompositeLogger` are available.
- Constructors now take an options object: `new ConsoleLogger({ level: 'info' })`.
- The `AIEngine`, `PromptBuilder`, `RateLimiter`, and `DiscordRouter` accept a `logger` instance; if provided to the engine, it is reused by defaults.

Example:

```ts
import {
  AIEngine,
  PromptBuilder,
  RateLimiter,
  ConsoleLogger,
  CompositeLogger,
  AuditLogger,
} from 'discord-ai-sdk';
import { openai } from '@ai-sdk/openai';

const logger = new CompositeLogger([
  new ConsoleLogger({ level: 'debug' }),
  new AuditLogger({ level: 'info', auditLogFn: async (g) => ({ channelId: '...' }) }),
]);

const engine = new AIEngine({
  model: openai('gpt-4o'),
  logger,
  promptBuilder: new PromptBuilder({ logger }),
  rateLimiter: new RateLimiter({ limitCount: 3, windowMs: 60_000, logger }),
});
```

## Type-safety notes

- Inputs are validated with `zod` schemas per tool; keep using object inputs.
- Avoid `any`; prefer `unknown` and narrow. Project ships strict TS settings.

## Environment

- `LOG_LEVEL` environment variable is honored by loggers.
- Required intents unchanged; ensure you enable guild/message/member intents for relevant tools.
