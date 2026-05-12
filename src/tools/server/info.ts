import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory for fetching server info.
 * @returns The tool factory.
 */
export const getServerInfoTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'get basic server info',
      inputSchema: z.object({}),
      execute: async (): Promise<ToolResult> => {
        logger?.info({
          message: 'getServerInfoTool called',
        });

        try {
          const { name, createdAt, memberCount, ownerId } = guild;

          logger?.info({
            message: 'getServerInfoTool completed',
            meta: { name, createdAt, memberCount, ownerId },
          });

          return {
            summary: `[OWNER: ${ownerId}] ${name} - ${memberCount} members [created: ${createdAt}]`,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'getServerInfoTool failed',
            meta: { message },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to fetch server info: ${message}` };
        }
      },
    }),
  safetyLevel: 'low',
};
