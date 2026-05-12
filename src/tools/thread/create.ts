import { tool } from 'ai';
import { ChannelType, ThreadAutoArchiveDuration } from 'discord.js';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to create a thread.
 * @returns The tool factory.
 */
export const createThreadTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'create a thread',
      inputSchema: z.object({
        channelId: z.string().describe('channel id'),
        name: z.string().describe('name of the thread'),
        autoArchiveDuration: z
          .enum(Object.values(ThreadAutoArchiveDuration) as [string, ...string[]])
          .describe('auto archive duration')
          .default('OneWeek'),
      }),
      execute: async ({ channelId, name, autoArchiveDuration }): Promise<ToolResult> => {
        logger?.info({
          message: 'createThreadTool called',
          meta: { channelId, name, autoArchiveDuration },
        });

        try {
          const channel = await guild.channels.fetch(channelId);
          if (!channel) {
            return { summary: `Channel ${channelId} not found` };
          }

          if (channel.type !== ChannelType.GuildText) {
            return { summary: `Channel ${channelId} is not a text channel` };
          }

          const thread = await channel.threads.create({
            name,
            autoArchiveDuration:
              ThreadAutoArchiveDuration[
                autoArchiveDuration as keyof typeof ThreadAutoArchiveDuration
              ],
          });

          logger?.info({
            message: 'createThreadTool completed',
            meta: { channelId, name, autoArchiveDuration },
          });

          return { summary: `Thread "${name}" created successfully with ID: ${thread.id}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'createThreadTool failed',
            meta: { channelId, name, autoArchiveDuration },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to create thread: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
