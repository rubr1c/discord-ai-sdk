import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory for deleting a channel.
 * @returns The tool factory.
 */
export const deleteChannelTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'delete a channel',
      inputSchema: z.object({
        id: z.string().describe('channel id'),
      }),
      execute: async ({ id }): Promise<ToolResult> => {
        logger?.info({
          message: 'deleteChannelTool called',
          meta: { id },
        });

        try {
          const channel = await guild.channels.fetch(id).catch(() => null);
          if (!channel) {
            return { summary: `Channel ${id} not found or inaccessible.` };
          }
          await channel.delete('Deleted via tool');

          logger?.info({
            message: 'deleteChannelTool completed',
            meta: { id },
          });

          return { summary: `Deleted channel ${channel.name} (${id}).` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);

          logger?.error({
            message: 'deleteChannelTool failed',
            meta: { id },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to delete channel ${id}: ${message}` };
        }
      },
    }),
  safetyLevel: 'high',
};
