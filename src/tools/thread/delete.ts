import type { ToolResult } from '@/tools/types';
import { tool } from 'ai';
import type { ToolFactory } from '@/tools/types';
import { ChannelType } from 'discord.js';
import z from 'zod';

/**
 * Creates a tool factory to delete a thread.
 * @returns The tool factory.
 */
export const deleteThreadTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'delete a thread',
      inputSchema: z.object({
        channelId: z.string().describe('channel id'),
        threadName: z.string().describe('thread name'),
      }),
      execute: async ({ channelId, threadName }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'deleteThreadTool called',
            meta: { channelId, threadName },
          });

          const channel = await guild.channels.fetch(channelId);
          if (!channel) {
            return { summary: `Channel ${channelId} not found` };
          }

          if (channel.type !== ChannelType.GuildText) {
            return { summary: `Channel ${channelId} is not a text channel` };
          }

          const thread = (await channel.threads.fetch()).threads.find(
            (thread) => thread.name === threadName,
          );

          if (!thread) {
            return { summary: `Thread ${threadName} not found` };
          }

          logger?.info({
            message: 'deleteThreadTool completed',
            meta: { channelId, threadName },
          });

          await thread.delete();

          return { summary: `Deleted thread ${threadName}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'deleteThreadTool failed',
            meta: { channelId, threadName },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to delete thread ${threadName}: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
