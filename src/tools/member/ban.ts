import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory for banning a member.
 * @returns The tool factory.
 */
export const banMemberTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'ban or unban a member from the server',
      inputSchema: z.object({
        userId: z
          .string()
          .regex(/^\d{17,20}$/, 'Invalid Discord user ID (snowflake)')
          .describe('Discord user ID of target user'),
        reason: z
          .string()
          .trim()
          .max(512, 'Reason must be <= 512 characters')
          .nullish()
          .describe('reason for ban or unban'),
        action: z.enum(['ban', 'unban']).describe('action to perform'),
      }),
      execute: async ({ userId, reason, action }): Promise<ToolResult> => {
        const normalizedReason = (reason ?? '').trim() || 'No reason provided';
        logger?.info({
          message: 'banMemberTool called',
          meta: { userId, reason, action },
        });

        try {
          if (action === 'ban') {
            await guild.members.ban(userId, { reason: normalizedReason });
          } else {
            await guild.members.unban(userId);
          }

          logger?.info({
            message: 'banMemberTool completed',
            meta: { userId, reason, action },
          });

          return { summary: `${action}ed user ${userId} (${normalizedReason})` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'banMemberTool failed',
            meta: { userId, reason, action },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to ban ${userId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'high',
};
