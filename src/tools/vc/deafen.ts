import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to defean a member in the server.
 * @returns The tool factory.
 */
export const deafenMemberTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'defean or undefean a member in the server',
      inputSchema: z.object({
        userId: z.string().describe('id of target user'),
        defean: z.boolean().describe('whether to defean the member'),
      }),
      execute: async ({ userId, defean }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'deafenMemberTool called',
            meta: { userId, defean },
          });

          const member = await guild.members.fetch(userId);
          await member.voice.setDeaf(defean);

          logger?.info({
            message: 'deafenMemberTool completed',
            meta: { userId, defean },
          });

          return { summary: `Defeaned member ${userId}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'deafenMemberTool failed',
            meta: { userId, defean },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to defean member ${userId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'high',
};
