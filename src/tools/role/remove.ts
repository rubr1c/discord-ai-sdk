import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to remove a role from a user.
 * @returns The tool factory.
 */
export const removeRoleTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'remove role from user',
      inputSchema: z.object({
        roleId: z.string().describe('id of role'),
        userId: z.string().describe('id of user'),
      }),
      execute: async ({ roleId, userId }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'removeRoleTool called',
            meta: { roleId, userId },
          });

          const user = await guild.members.fetch(userId);
          await user.roles.remove(roleId);

          logger?.info({
            message: 'removeRoleTool completed',
            meta: { roleId, userId },
          });

          return { summary: `Removed role ${roleId} from ${userId}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'removeRoleTool failed',
            meta: { roleId, userId },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to remove role ${roleId} from ${userId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
