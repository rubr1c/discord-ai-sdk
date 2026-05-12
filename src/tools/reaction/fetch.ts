import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to fetch reactions from a message.
 * @returns The tool factory.
 */
export const getReactionsTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'fetch reactions from a message',
      inputSchema: z.object({
        channelId: z.string().describe('id of channel'),
        messageId: z.string().describe('id of message'),
      }),
      execute: async ({ channelId, messageId }): Promise<ToolResult> => {
        try {
          const channel = await guild.channels.fetch(channelId);
          if (!channel?.isTextBased()) {
            return { summary: `Channel ${channelId} is not a text channel` };
          }
          const message = await channel.messages.fetch(messageId);

          const reactions = message.reactions.cache.map((reaction) => ({
            id: reaction.emoji.id,
            name: reaction.emoji.name,
            count: reaction.count,
          }));

          return { summary: `Fetched reactions from message ${messageId}`, data: reactions };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'getReactionsTool failed',
            meta: { channelId, messageId },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to fetch reactions from message ${messageId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
