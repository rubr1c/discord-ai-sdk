import { tool } from 'ai';
import { ChannelType } from 'discord.js';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory for deleting a channel category.
 * @returns The tool factory.
 */
export const deleteCategoryTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'delete channel category',
      inputSchema: z.object({
        id: z.string().describe('id of the category'),
      }),
      execute: async ({ id }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'deleteCategoryTool called',
            meta: { id },
          });

          const category = await guild.channels.fetch(id);
          if (!category) {
            return { summary: `Category ${id} not found` };
          }

          if (category.type !== ChannelType.GuildCategory) {
            return { summary: `Channel is not a category: ${id}` };
          }
          await category.delete();

          logger?.info({
            message: 'deleteCategoryTool completed',
            meta: { id },
          });

          return { summary: `Deleted Category: ${id}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'deleteCategoryTool failed',
            meta: { id },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to delete category ${id}: ${message}` };
        }
      },
    }),
  safetyLevel: 'high',
};
