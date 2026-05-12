import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to send a message in a channel.
 * @returns The tool factory.
 */
export const sendMessageTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'send a message in a channel',
      inputSchema: z.object({
        channelId: z.string().describe('id of channel'),
        content: z.string().min(1, 'message cannot be empty').max(2000).describe('message content'),
      }),
      execute: async ({ channelId, content }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'sendMessageTool called',
            meta: { channelId, content },
          });

          const channel = await guild.channels.fetch(channelId);
          if (!channel) {
            return { summary: `Channel ${channelId} not found in guild ${guild.name}` };
          }
          if (!channel.isTextBased()) {
            return {
              summary: `Channel ${'name' in channel ? `#${channel.name}` : channelId} is not text-based`,
            };
          }
          const sent = await channel.send(content);

          logger?.info({
            message: 'sendMessageTool completed',
            meta: { channelId, content },
          });

          return {
            summary: `Sent message to <#${channel.id}>`,
            data: { id: sent.id, url: sent.url, channelId: channel.id },
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'sendMessageTool failed',
            meta: { channelId, content },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to send message to ${channelId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
