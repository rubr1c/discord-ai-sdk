import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to fetch server bans.
 * @returns The tool factory.
 */
export const getBansTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'get bans for the server',
      inputSchema: z.object({}),
      execute: async (): Promise<ToolResult> => {
        logger?.info({
          message: 'getBansTool called',
        });
        try {
          const bans = await guild.bans.fetch();
          const bansList = bans.map((ban) => ({
            id: ban.user.id,
            username: ban.user.username,
            discriminator: ban.user.discriminator,
          }));

          logger?.info({
            message: 'getBansTool completed',
            meta: { bansList },
          });

          return { summary: `Found ${bansList.length} bans in this server`, data: bansList };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'getBansTool failed',
            meta: { message },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to fetch bans: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
