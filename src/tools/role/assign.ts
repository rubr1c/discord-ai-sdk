import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to assign a role to a user.
 * @returns The tool factory.
 */
export const assignRoleTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'assign role to user',
      inputSchema: z.object({
        roleId: z.string().describe('id of role'),
        userId: z.string().describe('id of user'),
      }),
      execute: async ({ roleId, userId }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'assignRoleTool called',
            meta: { roleId, userId },
          });

          const user = await guild.members.fetch(userId);
          await user.roles.add(roleId);

          logger?.info({
            message: 'assignRoleTool completed',
            meta: { roleId, userId },
          });

          return { summary: `Added role ${roleId} to ${userId}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'assignRoleTool failed',
            meta: { roleId, userId },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to assign role ${roleId} to ${userId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
