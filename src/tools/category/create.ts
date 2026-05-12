import { tool } from 'ai';
import { ChannelType } from 'discord.js';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory for creating a channel category.
 * @returns The tool factory.
 */
export const createCategoryTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'create channel category',
      inputSchema: z.object({
        name: z.string().describe('name of the category'),
      }),
      execute: async ({ name }): Promise<ToolResult> => {
        logger?.info({
          message: 'createCategoryTool called',
          meta: { name },
        });

        try {
          const category = await guild.channels.create({
            name: name,
            type: ChannelType.GuildCategory,
          });

          logger?.info({
            message: 'createCategoryTool completed',
            meta: { category },
          });

          return { summary: `Created Category: ${category.name}`, data: { id: category.id } };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'createCategoryTool failed',
            meta: { name },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to create category: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
