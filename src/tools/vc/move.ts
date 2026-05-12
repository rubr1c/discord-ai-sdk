import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to move a member to a different voice channel.
 * @returns The tool factory.
 */
export const moveMemberTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'move a member to a different voice channel',
      inputSchema: z.object({
        memberId: z.string().describe('id of member'),
        channelId: z.string().describe('id of channel'),
      }),
      execute: async ({ memberId, channelId }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'moveMemberTool called',
            meta: { memberId, channelId },
          });

          const member = await guild.members.fetch(memberId);
          await member.voice.setChannel(channelId);

          logger?.info({
            message: 'moveMemberTool completed',
            meta: { memberId, channelId },
          });

          return { summary: `Moved member ${memberId} to ${channelId}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'moveMemberTool failed',
            meta: { memberId, channelId },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to move member ${memberId} to ${channelId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'high',
};
