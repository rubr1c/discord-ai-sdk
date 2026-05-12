# Discord AI SDK

TypeScript SDK that connects Discord.js with the Vercel AI SDK to let AI safely perform Discord actions (channels, roles, members, messages, server) with guardrails.

### Features

- **AI engine**: step limits, retries, temperature/tokens, post-processing
- **Prompt builder**: strong system prompt + optional user rules
- **Tool registry**: built-in tools + custom tools with safety caps (`low`/`mid`/`high`)
- **Discord router**: message or slash modes, permission checks, channel gating, ephemeral replies, safe long-message splitting
- **Rate limiting**: per-user, overridable
- **Pluggable logging**: `ConsoleLogger`, `AuditLogger`, `CompositeLogger`; or bring your own

### Installation

```bash
# library
pnpm add discord-ai-sdk

# peers
pnpm add ai discord.js

# choose any model provider from ai sdk
pnpm add @ai-sdk/openai
```

Requirements: Node.js 18.17+ or 20+

### Quickstart

```ts
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { AIEngine, DiscordRouter, PromptBuilder, ConsoleLogger } from 'discord-ai-sdk';
import { openai } from '@ai-sdk/openai'; // model of choice from ai sdk

const client = new Client({
  // intents are required for the tools to work
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const engine = new AIEngine({
  model: openai('gpt-4o'),
  // Optional tuning: maxSteps: 5, maxRetries: 2, temperature: 0, maxTokens: 400
  logger: new ConsoleLogger({ level: 'info' }),
  promptBuilder: new PromptBuilder(),
});

const router = new DiscordRouter({
  mode: 'slash', // 'slash' | 'message'
  activator: 'assist', // slash command name or message prefix
  engine,
  // optional: ephemeralReplies: true,
  // optional: requiredRoleFn: async (g) => 'ROLE_ID',
  // optional: allowedChannelsFn: async (g) => ['CHANNEL_ID'],
});

client.once(Events.ClientReady, () => {
  router.subscribe(client);
});

client.login(process.env.DISCORD_TOKEN);
```

Run your bot:

```bash
pnpm tsx src/main.ts
```

Environment variables:

```bash
DISCORD_TOKEN=...            # from your Discord application
OPENAI_API_KEY=...           # or any model from ai sdk...
LOG_LEVEL=info               # debug | info | warn | error (optional)
```

### Configuration (at a glance)

- **Engine**: `maxSteps`, `maxRetries`, `temperature`, `maxTokens`, `promptBuilder`, `toolRegistry`, `rateLimiter`
- **Router**: `mode`, `activator`, `requiredRoleFn`, `allowedChannelsFn`, `ephemeralReplies`, `logger`
- **Rate limiter**: defaults to 3 requests / 60s per user; override with
  ```ts
  import { RateLimiter } from 'discord-ai-sdk';
  const engine = new AIEngine({
    model,
    rateLimiter: new RateLimiter({
      limitCount: 5,
      windowMs: 60_000,
      // optional: customRateLimits: async (userId, guild) => ({ limitCount: 3, windowMs: 30_000 })
    }),
  });
  ```

### Custom tools (optional)

By default, the engine registers a minimal tool set (channels, roles, and selected member/message tools) to keep the model focused. The built-in `discordApiTools` are grouped by domain so you can opt-in per group or mix with custom tools.

```ts
import { ToolRegistry, discordApiTools } from 'discord-ai-sdk';
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

const toolRegistry = new ToolRegistry({
  tools: {
    // opt-in to built-in groups you need
    ...discordApiTools.channelTools,
    getMessages: discordApiTools.messageTools.getMessages,
    sendMessage: discordApiTools.messageTools.sendMessage,
    // add your custom tools
    myCustomTool,
  },
});
```

See docs for more groups: roles, categories, members, messages, threads, reactions, voice (VC), and audit logs.

### Useful links

- **AI SDK docs**: [https://ai-sdk.dev/docs](https://ai-sdk.dev/docs)
- **discord.js guide**: [https://discord.js.org](https://discord.js.org)
- **AI SDK repo**: [https://github.com/vercel/ai](https://github.com/vercel/ai)

## Contributing

contributions are welcome, please read [`Contribution Guidelines`](CONTRIBUTING.md) before you start

---

### License

MIT — see [`LICENSE`](LICENSE).
