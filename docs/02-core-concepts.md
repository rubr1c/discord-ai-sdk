# Core Concepts

## AIEngine

Coordinates the AI model with prompts, tools, rate limits, and logging.

- **Model wiring**: Pass a `LanguageModel` from `ai` (e.g., `openai('gpt-4o')`).
- **Steps and retries**: `maxSteps` (default 5), `maxRetries` (default 2).
- **Temperature/tokens**: `temperature` (default 0), `maxTokens` (default 400).
- **Post-processing**: If model text is empty, summarizes tool runs into a user-friendly message.
- **Defaults**: If not provided, it constructs `PromptBuilder`, a `ToolRegistry` preloaded with a minimal default set of tools (channels, roles, and selected member/message tools), and `RateLimiter` (3 requests/60s).

```ts
import { AIEngine, PromptBuilder, ToolRegistry, RateLimiter } from 'discord-ai-sdk';
import { openai } from '@ai-sdk/openai';

const engine = new AIEngine({
  model: openai('gpt-4o'),
  maxSteps: 5,
  maxRetries: 2,
  temperature: 0,
  maxTokens: 400,
});
```

## DiscordRouter

Routes Discord events to the engine in two modes: `slash` or `message`.

- **Modes**: Slash command or message prefix.
- **Activator**: Slash command name or message prefix.
- **Channel gating**: `allowedChannelsFn(guild) => string[]`.
- **Role checks**: `requiredRoleFn(guild) => string` or default Administrator check.
- **Ephemeral replies**: `ephemeralReplies` for slash interactions.
- **Long-message splitting**: Responses split to fit Discord’s 2,000-char limit.

```ts
const router = new DiscordRouter({
  mode: 'slash',
  activator: 'assist',
  engine,
  requiredRoleFn: async (guild) => 'ROLE_ID',
  allowedChannelsFn: async (guild) => ['CHANNEL_ID'],
  ephemeralReplies: true,
});
```

## ToolRegistry

Holds the available tools and filters by a safety cap.

- **Registration**: Add/remove tools; provide flattened groups from `discordApiTools` or custom.
- **Safety caps**: `low` < `mid` < `high`. Cap can be a string or `async (guild) => Safety`.
- **Filtering**: `getAllAvailableTools(ctx)` returns only tools at or below the cap.

```ts
import { ToolRegistry, discordApiTools } from 'discord-ai-sdk';

const reg = new ToolRegistry({
  tools: {
    // opt-in to groups you want the model to use
    ...discordApiTools.channelTools,
    ...discordApiTools.messageTools,
    ...discordApiTools.memberTools,
  },
});
reg.setSafetyModeCap('mid');
```

## PromptBuilder

Builds a strong system prompt plus optional user rules.

- **System prompt strategy**: Safety, permissions, destructive-action constraints.
- **User rules**: `addRule/removeRule/resetRules`; `override(system)` when necessary.

```ts
import { PromptBuilder } from 'discord-ai-sdk';
const pb = new PromptBuilder();
pb.addRule('Prefer concise responses.');
```

## RateLimiter

Per-user limiter with optional per-guild overrides.

- **Defaults in engine**: 3 requests per 60s.
- **Overrides**: Supply `customRateLimits(userId, guild)`.
- **Utilities**: `resetFor(userId)`, `resetAll()`.

```ts
import { RateLimiter } from 'discord-ai-sdk';
const rl = new RateLimiter({ limitCount: 3, windowMs: 60_000 });
```

## Logger

`ConsoleLogger`/`AuditLogger`/`CompositeLogger` implement leveled logging; they respect `LOG_LEVEL` env. You can provide any object implementing the `Logger` interface.

```ts
import { ConsoleLogger, CompositeLogger, AuditLogger } from 'discord-ai-sdk';

const logger = new ConsoleLogger({ level: 'debug' });

// Example: fan-out to multiple loggers
const composite = new CompositeLogger([
  new ConsoleLogger({ level: 'debug' }),
  new AuditLogger({ level: 'info', auditLogFn: async (g) => ({ channelId: '123' }) }),
]);
```
