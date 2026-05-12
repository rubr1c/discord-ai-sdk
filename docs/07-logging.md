# Logging

The SDK ships with a pluggable logging system:

- `ConsoleLogger`: logs to stdout with timestamps.
- `AuditLogger`: buffers and flushes logs to a server-defined audit log channel.
- `CompositeLogger`: fan-out to multiple loggers.
- All loggers extend `BaseLogger` and respect `level` (`debug` | `info` | `warn` | `error`).
- You can also supply your own `Logger` implementation.

`LOG_LEVEL` can also be set via the `LOG_LEVEL` environment variable.

## ConsoleLogger

```ts
import { ConsoleLogger } from 'discord-ai-sdk';

const logger = new ConsoleLogger({ level: 'debug' });
logger.info({ message: 'engine started' });
```

## AuditLogger

Provide a function that resolves the audit channel per guild. The logger batches and flushes messages at an interval.

```ts
import { AuditLogger } from 'discord-ai-sdk';

const auditLogger = new AuditLogger({
  level: 'info',
  flushInterval: 2000,
  auditLogFn: async (guild) => {
    // resolve channel id from your db
    return { channelId: '123456789012345678' };
  },
});
```

## CompositeLogger

Fan-out to multiple loggers.

```ts
import { CompositeLogger, ConsoleLogger, AuditLogger } from 'discord-ai-sdk';

const composite = new CompositeLogger([
  new ConsoleLogger({ level: 'debug' }),
  new AuditLogger({ level: 'info', auditLogFn: async (g) => ({ channelId: '...' }) }),
]);
```

## Passing the logger to components

When you pass a logger to `AIEngine`, it is reused by other components unless overridden.

```ts
import { AIEngine, DiscordRouter, PromptBuilder, RateLimiter } from 'discord-ai-sdk';
import { openai } from '@ai-sdk/openai';

const engine = new AIEngine({
  model: openai('gpt-4o'),
  logger: composite, // shared
  promptBuilder: new PromptBuilder({ logger: composite }),
  rateLimiter: new RateLimiter({ limitCount: 3, windowMs: 60_000, logger: composite }),
});

const router = new DiscordRouter({
  mode: 'slash',
  activator: 'assist',
  engine,
  // logger: composite, // optional override
});
```

## Log format

Loggers receive a structured `LoggerParams` object:

```ts
type LoggerParams = {
  message: string;
  guild?: Guild;
  meta?: unknown; // additional context, e.g., tool name, userId, counts
};
```

Timestamps are ISO-8601 and levels are normalized across loggers.
