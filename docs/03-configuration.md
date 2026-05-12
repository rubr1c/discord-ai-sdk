# Configuration

## Engine Options

AIEngine constructor options (defaults shown):

- `model`: Language model from `ai` (required)
- `promptBuilder`: `new PromptBuilder({ system: '', override: false, logger })`
- `toolRegistry`: by default, an internal `ToolRegistry` is created with a minimal set of tools (channels, roles, `member.getMembers`, `member.getUserId`, `message.getMessages`, `message.sendMessage`).
- `rateLimiter`: `new RateLimiter({ limitCount: 3, windowMs: 60000, logger })`
- `logger?`: `Logger | CompositeLogger`
- `maxRetries`: 2
- `maxSteps`: 5
- `temperature`: 0
- `maxTokens`: 400

Example:

```ts
import {
  AIEngine,
  PromptBuilder,
  ToolRegistry,
  ConsoleLogger,
  discordApiTools,
} from 'discord-ai-sdk';
import { openai } from '@ai-sdk/openai';

const logger = new ConsoleLogger({ level: 'info' });

const engine = new AIEngine({
  model: openai('gpt-4o'),
  logger,
  promptBuilder: new PromptBuilder({ system: 'You are helpful.', logger }),
  maxSteps: 5,
  maxRetries: 2,
  temperature: 0,
  maxTokens: 400,
});
```

## Router Options

- `mode`: `'slash' | 'message'`
- `engine`: `AIEngine`
- `activator`: string (slash command name or message prefix)
- `requiredRoleFn?`: `(guild) => Promise<string>`
- `allowedChannelsFn?`: `(guild) => Promise<string[]>`
- `ephemeralReplies?`: boolean (default false)
- `logger?`: defaults to engine logger

## Rate Limiter Options

- `limitCount`: number of requests per window
- `windowMs`: window length in ms
- `customRateLimits?`: `(userId, guild) => Promise<{ limitCount: number; windowMs: number }>`
- `logger?`: logger instance to use

## Environment Variables

| Variable        | Description                                                  |
| --------------- | ------------------------------------------------------------ | ------ | ------ | ------- |
| `DISCORD_TOKEN` | Discord bot token                                            |
| `AI_API_KEY`    | Provider API key used by the AI SDK (e.g., `OPENAI_API_KEY`) |
| `LOG_LEVEL`     | `debug`                                                      | `info` | `warn` | `error` |

## Path Alias

Configured in `tsconfig.json` and `vitest.config.ts`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## TypeScript Strict Settings

The project ships with strict options enabled (e.g., `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns`). Avoid `any`; prefer `unknown` with narrowing.

## Required Discord Intents

At minimum for messaging tools:

```ts
intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
];
```

## Security Stance

- **Destructive actions must be unambiguous** (e.g., delete/ban/kick/rename/set-server-name). If the target cannot be resolved with certainty, do not act.
- **Permission checks respected** at runtime via Discord roles/permissions and optional router gates.
