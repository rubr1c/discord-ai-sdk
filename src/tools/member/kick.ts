import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory for kicking a member from the server.
 * @returns The tool factory.
 */
export const kickMemberTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'kick a member from the server',
      inputSchema: z.object({
        userId: z.string().describe('id of target user'),
        reason: z.string().nullable().describe('reason for kick'),
      }),
      execute: async ({ userId, reason }): Promise<ToolResult> => {
        const normalizedReason = (reason ?? '').trim() || 'No reason provided';
        logger?.info({
          message: 'kickMemberTool called',
          meta: { userId, reason },
        });

        try {
          const user = await guild.members.fetch(userId);

          await user.kick(normalizedReason);

          logger?.info({
            message: 'kickMemberTool completed',
            meta: { userId, reason },
          });

          return { summary: `Kicked user ${userId}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'kickMemberTool failed',
            meta: { userId, reason },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to kick ${userId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'high',
};
