import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to delete a message.
 * @returns The tool factory.
 */
export const deleteMessageTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'delete a message in a channel',
      inputSchema: z.object({
        channelId: z.string().describe('id of channel'),
        messageId: z.string().describe('id of message'),
      }),
      execute: async ({ channelId, messageId }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'deleteMessageTool called',
            meta: { channelId, messageId },
          });

          const channel = await guild.channels.fetch(channelId);
          if (!channel) {
            return { summary: `Channel ${channelId} not found` };
          }

          if (!channel.isTextBased()) {
            return { summary: `Channel ${channelId} is not a text channel` };
          }

          const msg = await channel.messages.fetch(messageId);
          await msg.delete();

          logger?.info({
            message: 'deleteMessageTool completed',
            meta: { channelId, messageId },
          });

          return { summary: `Deleted message ${messageId}` };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'deleteMessageTool failed',
            meta: { channelId, messageId },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to delete message ${messageId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'high',
};
