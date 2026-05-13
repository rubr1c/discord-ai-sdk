import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory for seting a nickname for a member.
 * @returns The tool factory.
 */
export const nicknameMemberTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'set nickname for member',
      inputSchema: z.object({
        userId: z
          .string()
          .regex(/^\d{17,20}$/)
          .describe('Discord user snowflake'),
        nickname: z.string().describe('nickname to set'),
      }),
      execute: async ({ userId, nickname }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'nicknameMemberTool called',
            meta: { userId, nickname },
          });

          const user = await guild.members.fetch(userId);

          user.setNickname(nickname);

          logger?.info({
            message: 'nicknameMemberTool completed',
            meta: { userId, nickname },
          });

          return { summary: `set nickname for ${userId}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'nicknameMemberTool failed',
            meta: { userId, nickname },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to set nickname for ${userId}` };
        }
      },
    }),
  safetyLevel: 'low',
};
