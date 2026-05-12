import { tool } from 'ai';
import { StickerFormatType } from 'discord.js';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to fetch server stickers.
 * @returns The tool factory.
 */
export const getStickersTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'get server stickers',
      inputSchema: z.object({}),
      execute: async (): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'getStickersTool called',
          });

          const fetched = await guild.stickers.fetch();
          const list = Array.from(fetched.values()).map((s) => ({
            id: s.id,
            name: s.name,
            url: s.url,
            available: s.available,
            format: String(StickerFormatType[s.format]).toLowerCase(),
          }));

          logger?.info({
            message: 'getStickersTool completed',
            meta: { list },
          });

          return {
            summary: `Fetched stickers (${list.length})`,
            data: list,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'getStickersTool failed',
            meta: { message },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to fetch stickers: ${message}` };
        }
      },
    }),
  safetyLevel: 'low',
};
