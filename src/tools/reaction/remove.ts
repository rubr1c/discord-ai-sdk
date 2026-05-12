import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to remove a reaction from a message.
 * @returns The tool factory.
 */
export const removeReactionTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'remove a reaction from a message',
      inputSchema: z.object({
        channelId: z.string().describe('id of channel'),
        messageId: z.string().describe('id of message'),
        emoji: z.string().describe('emoji to remove (from fetching or default discord emojis)'),
      }),
      execute: async ({ channelId, messageId, emoji }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'removeReactionTool called',
            meta: { channelId, messageId, emoji },
          });

          const channel = await guild.channels.fetch(channelId);

          if (!channel?.isTextBased()) {
            return { summary: `Channel ${channelId} is not a text channel` };
          }

          const message = await channel.messages.fetch(messageId);

          await message.reactions.cache.get(emoji)?.remove();

          return { summary: `Removed reaction ${emoji} from message ${messageId}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'removeReactionTool failed',
            meta: { channelId, messageId, emoji },
            error: err instanceof Error ? err : new Error(message),
          });
          return {
            summary: `Failed to remove reaction ${emoji} from message ${messageId}: ${message}`,
          };
        }
      },
    }),
  safetyLevel: 'mid',
};
