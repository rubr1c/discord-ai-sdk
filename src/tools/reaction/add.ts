import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to add a reaction to a message.
 * @returns The tool factory.
 */
export const addReactionTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'add a reaction to a message',
      inputSchema: z.object({
        channelId: z.string().describe('id of channel'),
        messageId: z.string().describe('id of message'),
        emoji: z
          .string()
          .describe(
            'emoji to react with (from fetching or default discord emojis) format [:{id or name}:]',
          )
          .regex(/^:(\d{17,20}):$/),
      }),
      execute: async ({ channelId, messageId, emoji }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'addReactionTool called',
            meta: { channelId, messageId, emoji },
          });

          const channel = await guild.channels.fetch(channelId);

          if (!channel?.isTextBased()) {
            return { summary: `Channel ${channelId} is not a text channel` };
          }

          const message = await channel.messages.fetch(messageId);
          await message.react(emoji);

          logger?.info({
            message: 'addReactionTool completed',
            meta: { channelId, messageId, emoji },
          });

          return { summary: `Added reaction ${emoji} to message ${messageId}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'addReactionTool failed',
            meta: { channelId, messageId, emoji },
            error: err instanceof Error ? err : new Error(message),
          });
          return {
            summary: `Failed to add reaction ${emoji} to message ${messageId}: ${message}`,
          };
        }
      },
    }),
  safetyLevel: 'mid',
};
