import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory for moving a channel.
 * @returns The tool factory.
 */
export const moveChannelTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'move channel (reorder / move into category)',
      inputSchema: z.object({
        channelId: z.string().describe('channel id'),
        position: z.number().int().describe('position in catagory'),
        categoryId: z
          .string()
          .nullable()
          .describe(
            'Category ID where the channel should be created. Use the ID from getCategories tool output.',
          ),
      }),
      execute: async ({ channelId, position, categoryId }): Promise<ToolResult> => {
        logger?.info({
          message: 'moveChannelTool called',
          meta: { channelId, position, categoryId },
        });

        try {
          const channel = await guild.channels.fetch(channelId);

          if (!channel) {
            return { summary: `Channel ${channelId} not found` };
          }

          const updated = await channel.edit({ parent: categoryId ?? null, position });
          const parentLabel = updated.parent?.name ?? 'no category';

          logger?.info({
            message: 'moveChannelTool completed',
            meta: { updated },
          });

          return {
            summary: `Moved ${updated.name} to ${parentLabel} at position ${position}`,
            data: { id: updated.id, name: updated.name, categoryId: updated.parent?.id ?? null },
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'moveChannelTool failed',
            meta: { channelId, position, categoryId },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to move channel ${channelId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
