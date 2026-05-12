import { Client, GatewayIntentBits, Events } from 'discord.js';
import { AIEngine, ConsoleLogger, DiscordRouter } from 'discord-ai-sdk';
// model of choice from ai sdk
// @ts-expect-error - @ai-sdk/openai is not installed in this example project
import { openai } from '@ai-sdk/openai';
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

const engine = new AIEngine({
  model: openai('gpt-4o'),
});

const router = new DiscordRouter({
  mode: 'slash', // 'slash' | 'message'
  activator: 'assist', // slash command name or message prefix
  engine,
  requiredRoleFn: async (guild) => {
    const guildData = await prisma.guilds.findUnique({
      where: {
        id: guild.id,
      },
    });
    return guildData?.requiredRole ?? '';
  }, // required role for the router
  allowedChannelsFn: async (guild) => {
    const guildData = await prisma.guilds.findUnique({
      where: {
        id: guild.id,
      },
    });
    return guildData?.allowedChannels ?? [];
  }, // allowed channels for the router
  ephemeralReplies: true, // ephemeral replies for the router
  logger: new ConsoleLogger({ level: 'info' }), // logger for the router; defaults to engine logger if omitted
});

client.once(Events.ClientReady, () => {
  router.subscribe(client);
});

client.login(process.env.DISCORD_TOKEN);
