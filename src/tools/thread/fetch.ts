import { tool } from 'ai';
import { ChannelType } from 'discord.js';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool to fetch threads.
 * @returns The tool factory.
 */
export const getThreadsTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'fetch threads',
      inputSchema: z.object({
        channelId: z.string().describe('channel id'),
      }),
      execute: async ({ channelId }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'getThreadsTool called',
            meta: { channelId },
          });

          const channel = await guild.channels.fetch(channelId);
          if (!channel) {
            return { summary: `Channel ${channelId} not found` };
          }
          if (channel.type !== ChannelType.GuildText) {
            return { summary: `Channel ${channelId} is not a text channel` };
          }
          const { threads, members } = await channel.threads.fetch();

          logger?.info({
            message: 'getThreadsTool completed',
            meta: { channelId, threads, members },
          });

          return { summary: `Fetched ${threads.size} threads`, data: { threads, members } };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'getThreadsTool failed',
            meta: { channelId },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to fetch threads: ${message}` };
        }
      },
    }),
  safetyLevel: 'low',
};
