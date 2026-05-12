import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to disconnect a member from the server.
 * @returns The tool factory.
 */
export const disconnectMemberTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'disconnect a member from the server',
      inputSchema: z.object({
        userId: z.string().describe('id of target user'),
      }),
      execute: async ({ userId }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'disconnectMemberTool called',
            meta: { userId },
          });

          const member = await guild.members.fetch(userId);
          await member.voice.disconnect();

          logger?.info({
            message: 'disconnectMemberTool completed',
            meta: { userId },
          });

          return { summary: `Disconnected member ${userId}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'disconnectMemberTool failed',
            meta: { userId },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to disconnect member ${userId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'high',
};
