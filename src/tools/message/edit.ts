import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '../types';

/**
 * Creates a tool factory to edit a message.
 * @returns The tool factory.
 */
export const editMessageTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'edit a message in a channel',
      inputSchema: z.object({
        channelId: z.string().describe('id of channel'),
        messageId: z.string().describe('id of message'),
        newMessage: z.string().describe('new message to set'),
      }),
      execute: async ({ channelId, messageId, newMessage }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'editMessageTool called',
            meta: { channelId, messageId, newMessage },
          });

          const channel = await guild.channels.fetch(channelId);
          if (!channel) {
            return { summary: `Channel ${channelId} not found` };
          }

          if (!channel.isTextBased()) {
            return { summary: `Channel ${channelId} is not a text channel` };
          }

          const msg = await channel.messages.fetch(messageId);
          await msg.edit(newMessage);

          logger?.info({
            message: 'editMessageTool completed',
            meta: { channelId, messageId, newMessage },
          });

          return { summary: `Edited message ${messageId}` };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'editMessageTool failed',
            meta: { channelId, messageId, newMessage },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to edit message ${messageId}: ${newMessage}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
