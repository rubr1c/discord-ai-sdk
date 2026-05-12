# Getting Started

## Overview

This SDK is an AI middleware between `discord.js` and the Vercel AI SDK (`ai`). It lets an AI model call safe, typed Discord "tools" (channels, roles, members, messages, server) with guardrails. You provide prompts; it calls the model, orchestrates tools, enforces limits/permissions, and returns clean responses.

## When to Use

- Integrate AI-driven interactions in Discord servers
- Let AI manage channels/roles/messages with guardrails and summaries
- Enforce per-guild safety caps, role/channel gating, and rate limits

## Requirements

- Node.js 18.17+ or 20+
- Peer deps: `ai`, `discord.js`

## Installation

Install the library, peers, and a model provider from the AI SDK (example: OpenAI):

```bash
pnpm add discord-ai-sdk ai discord.js
pnpm add @ai-sdk/openai
```

## Quickstart (Slash Commands)

```ts
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { AIEngine, DiscordRouter } from 'discord-ai-sdk';
import { openai } from '@ai-sdk/openai';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const engine = new AIEngine({
  model: openai('gpt-4o'),
  // optional: logger: new ConsoleLogger({ level: 'info' }),
});

const router = new DiscordRouter({
  mode: 'slash',
  activator: 'assist',
  engine,
});

client.once(Events.ClientReady, () => {
  router.subscribe(client);
});

client.login(process.env.DISCORD_TOKEN);
```

## Quickstart (Message Prefix)

```ts
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { AIEngine, DiscordRouter } from 'discord-ai-sdk';
import { openai } from '@ai-sdk/openai';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const engine = new AIEngine({ model: openai('gpt-4o') });

const router = new DiscordRouter({
  mode: 'message',
  activator: '!ai',
  engine,
});

client.once(Events.ClientReady, () => {
  router.subscribe(client);
});

client.login(process.env.DISCORD_TOKEN);
```

## Environment Variables

- `DISCORD_TOKEN`: Your Discord bot token
- `AI_API_KEY`: API key for your AI provider via the AI SDK (e.g., `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`). Use the provider-specific env var; we refer to it generically as `AI_API_KEY` here.
- `LOG_LEVEL`: Logger verbosity (`debug`, `info`, `warn`, `error`)

## Run

Use your preferred runner. Two common options:

```bash
# one-off run without installing tsx
pnpm dlx tsx bot.ts

# or if you add a script
# package.json: { "scripts": { "dev": "tsx bot.ts" } }
pnpm run dev
```
