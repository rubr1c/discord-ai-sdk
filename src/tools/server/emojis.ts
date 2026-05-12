import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to fetch server emojis.
 * @returns The tool factory.
 */
export const getEmojisTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'get server emojis',
      inputSchema: z.object({}),
      execute: async (): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'getEmojisTool called',
          });

          const fetched = await guild.emojis.fetch();
          const list = Array.from(fetched.values()).map((e) => ({
            id: e.id,
            name: e.name,
            url: e.imageURL(),
            animated: e.animated,
            available: e.available,
            managed: e.managed,
            requiresColons: e.requiresColons,
          }));

          logger?.info({
            message: 'getEmojisTool completed',
            meta: { list },
          });

          return {
            summary: `Fetched emojis (${list.length})`,
            data: list,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'getEmojisTool failed',
            meta: { message },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to fetch emojis: ${message}` };
        }
      },
    }),
  safetyLevel: 'low',
};
