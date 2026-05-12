import { Client, GatewayIntentBits, Events } from 'discord.js';
import { AIEngine, discordApiTools, DiscordRouter, ToolRegistry } from 'discord-ai-sdk';
import type { ToolFactory, ToolResult } from 'discord-ai-sdk';
// model of choice from ai sdk
// @ts-expect-error - @ai-sdk/openai is not installed in this example project
import { openai } from '@ai-sdk/openai';
import { tool } from 'ai';
import { z } from 'zod';
// @ts-expect-error - prisma is not set up in this example project
import { prisma } from './prisma';

const client = new Client({
  // intents are required for the tools to work
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Define custom tools using the ToolFactory pattern
const myTool: ToolFactory = {
  safetyLevel: 'low',
  tool: ({ guild, logger }) =>
    tool({
      description: 'my tool',
      inputSchema: z.object({
        name: z.string(),
      }),
      execute: async ({ name }): Promise<ToolResult> => {
        logger?.info({
          message: 'myTool called',
          meta: { name },
        });
        return { summary: `[${guild.name}] Hello ${name}` };
      },
    }),
};

const myTool2: ToolFactory = {
  safetyLevel: 'low',
  tool: ({ guild }) =>
    tool({
      description: 'my tool 2',
      inputSchema: z.object({
        name: z.string(),
      }),
      execute: async ({ name }): Promise<ToolResult> => {
        return { summary: `[${guild.name}] Hello ${name}` };
      },
    }),
};

const toolRegistry = new ToolRegistry({
  tools: {
    // add the tools you want from the original tools
    ...discordApiTools.channelTools,
    ...discordApiTools.serverTools,
    myTool,
  },
});

toolRegistry.addTool('myTool2', myTool2, true);

toolRegistry.removeTool('myTool2');

// set the safety mode cap function
toolRegistry.setSafetyModeCap(async (guild) => {
  const guildData = await prisma.guilds.findUnique({
    where: {
      id: guild.id,
    },
  });
  return guildData?.safetyModeCap ?? 'high';
});
//or set the safety mode cap globally with a string
toolRegistry.setSafetyModeCap('low');

// return a single tool
toolRegistry.getTool('myTool2');

// return all tools
toolRegistry.getAllTools();

// @ts-expect-error - missing context
toolRegistry.getAllAvailableTools(context);

const engine = new AIEngine({
  model: openai('gpt-4o'),
  toolRegistry, // default has discordApiTools already
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
