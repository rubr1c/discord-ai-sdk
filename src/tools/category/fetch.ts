import { tool } from 'ai';
import { ChannelType } from 'discord.js';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory for fetching existing channel categories.
 * @returns The tool factory.
 */
export const getCategoriesTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'fetch existing channel categories',
      inputSchema: z.object({}),
      execute: async (): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'getCategoriesTool called',
          });

          const channels = await guild.channels.fetch();
          const categories = channels.filter(
            (channel) => channel?.type == ChannelType.GuildCategory,
          );

          const categoryList = categories.map((category) => ({
            id: category?.id,
            name: category?.name,
            position: category?.position,
          }));

          logger?.info({
            message: 'getCategoriesTool completed',
            meta: { categoryList },
          });

          return {
            summary: `Found ${categoryList.length} categories in this server`,
            data: categoryList,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);

          logger?.error({
            message: 'getCategoriesTool failed',
            meta: { message },
            error: err instanceof Error ? err : new Error(message),
          });

          return { summary: `Failed to fetch categories: ${message}` };
        }
      },
    }),
  safetyLevel: 'low',
};
