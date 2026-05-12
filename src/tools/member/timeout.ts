import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory for timing out a member.
 * @returns The tool factory.
 */
export const timeoutMemberTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'timeout or untimeout a member in the server',
      inputSchema: z.object({
        userId: z
          .string()
          .regex(/^\d{17,20}$/)
          .describe('Discord user snowflake'),
        action: z.enum(['timeout', 'untimeout']).describe('action to perform'),
        reason: z.string().max(512).optional().describe('audit log reason (<=512 chars)'),
        duration: z.coerce
          .number()
          .int()
          .min(5_000)
          .max(2_419_200_000)
          .describe('duration in ms (5s–28d)'),
      }),
      execute: async ({ userId, reason, duration, action }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'timeoutMemberTool called',
            meta: { userId, reason, duration, action },
          });

          const user = await guild.members.fetch(userId);

          if (action === 'timeout') {
            await user.timeout(duration, reason ?? '');
          } else {
            await user.disableCommunicationUntil(null, 'Timeout removed');
          }

          logger?.info({
            message: 'timeoutMemberTool completed',
            meta: { userId, reason, duration, action },
          });

          return { summary: `${action}ed user ${userId} for ${duration}ms` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'timeoutMemberTool failed',
            meta: { userId, reason, duration, action },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to timeout user ${userId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'high',
};
