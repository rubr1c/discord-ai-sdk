import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory for renaming a channel.
 * @returns The tool factory.
 */
export const renameChannelTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'rename a channel',
      inputSchema: z.object({
        channelId: z.string().describe('channel id'),
        newName: z
          .string()
          .min(1, 'Channel name cannot be empty')
          .max(100, 'Channel name too long')
          .describe('Channel name (lowercase, no spaces, use dashes between words)'),
      }),
      execute: async ({ channelId, newName }): Promise<ToolResult> => {
        logger?.info({
          message: 'renameChannelTool called',
          meta: { channelId, newName },
        });

        const channelName = newName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\-_]/g, '')
          .replace(/^-+|-+$/g, '');

        try {
          const channel = await guild.channels.fetch(channelId);

          await channel?.edit({ name: channelName });

          logger?.info({
            message: 'renameChannelTool completed',
            meta: { channelId, channelName },
          });

          return { summary: `Edited channel name of channel [${channelId}] to ${channelName}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'renameChannelTool failed',
            meta: { channelId, newName },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to rename channel ${channelId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
