import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to mute a member in the server.
 * @returns The tool factory.
 */
export const muteMemberTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'mute or unmute a member in the server',
      inputSchema: z.object({
        userId: z.string().describe('id of target user'),
        mute: z.boolean().describe('whether to mute the member'),
      }),
      execute: async ({ userId, mute }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'muteMemberTool called',
            meta: { userId, mute },
          });

          const member = await guild.members.fetch(userId);
          await member.voice.setMute(mute);

          logger?.info({
            message: 'muteMemberTool completed',
            meta: { userId, mute },
          });

          return { summary: `Muted member ${userId}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'muteMemberTool failed',
            meta: { userId, mute },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to mute member ${userId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'high',
};
