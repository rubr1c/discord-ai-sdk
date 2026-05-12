import { tool } from 'ai';
import { ChannelType } from 'discord.js';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to archive a thread.
 * @returns The tool factory.
 */
export const archiveThreadTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'archive a thread',
      inputSchema: z.object({
        channelId: z.string().describe('channel id'),
        threadName: z.string().describe('thread name'),
        archived: z.boolean().describe('archived status'),
      }),
      execute: async ({ channelId, threadName, archived }): Promise<ToolResult> => {
        logger?.info({
          message: 'archiveThreadTool called',
          meta: { channelId, threadName, archived },
        });

        try {
          const channel = await guild.channels.fetch(channelId);

          if (!channel) {
            return { summary: `Thread ${channelId} not found` };
          }

          if (channel.type !== ChannelType.GuildText) {
            return { summary: `Thread ${channelId} is not a text channel` };
          }

          const thread = (await channel.threads.fetch()).threads.find(
            (thread) => thread.name === threadName,
          );

          if (!thread) {
            return { summary: `Thread ${threadName} not found` };
          }

          logger?.info({
            message: 'archiveThreadTool completed',
            meta: { channelId, threadName, archived },
          });

          await thread.setArchived(archived);
          return { summary: `Archived thread ${threadName} ${archived ? 'true' : 'false'}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'archiveThreadTool failed',
            meta: { channelId, threadName, archived },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to archive thread ${threadName}: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
