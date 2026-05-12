# Extensibility

You can add your own tools alongside the built-ins and control their availability with safety levels and caps.

## Creating a custom tool

```ts
import { tool } from 'ai';
import z from 'zod';
import { ToolRegistry, discordApiTools } from 'discord-ai-sdk';
import type { ToolFactory, ToolResult } from '@/tools/types';

// Define as a ToolFactory
export const myCustomTool: ToolFactory = {
  safetyLevel: 'low',
  tool: ({ guild, logger }) =>
    tool({
      description: 'do something safe and useful',
      inputSchema: z.object({ name: z.string().min(1) }),
      execute: async ({ name }): Promise<ToolResult> => {
        logger.info({ message: 'myCustomTool.execute', guild, meta: { name } });
        // ... your logic here ...
        return { summary: `Hello ${name}` };
      },
    }),
};

const registry = new ToolRegistry({
  tools: {
    ...discordApiTools.channelTools,
    myCustomTool,
  },
});
```

## Safety model

- Every registered tool has a safety level: `'low' | 'mid' | 'high'`.
- You can cap the max safety a guild can access globally or per-guild.

Global cap:

```ts
registry.setSafetyModeCap('mid');
```

Per-guild cap via async function:

```ts
registry.setSafetyModeCap(async (guild) => {
  // fetch from db or config
  return 'high';
});
```

## Discoverability

```ts
registry.getTool('myCustomTool'); // single tool or undefined
registry.getAllTools(); // all registered tools

// Requires request context to filter by safety cap and permissions
// const available = await registry.getAllAvailableTools(context);
```

## Using with the engine

```ts
import { AIEngine } from 'discord-ai-sdk';
import { openai } from '@ai-sdk/openai';

const engine = new AIEngine({
  model: openai('gpt-4o'),
  toolRegistry: registry,
});
```
