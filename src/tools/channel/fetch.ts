import { tool } from 'ai';
import { ChannelType } from 'discord.js';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory for fetching existing channels.
 * @returns The tool factory.
 */
export const getChannelsTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description:
        'fetch existing channels (all types by default, or filter by specific channel type)',
      inputSchema: z.object({
        type: z.enum(['voice', 'text']).optional().describe('type of channel to fetch'),
      }),
      execute: async ({ type }): Promise<ToolResult> => {
        logger?.info({
          message: 'getChannelsTool called',
          meta: { type },
        });

        try {
          const channels = (await guild.channels.fetch()).filter((channel) =>
            type
              ? channel?.type ===
                (type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText)
              : true,
          );

          const channelList = channels.map((channel) => ({
            id: channel?.id,
            name: channel?.name,
            type: channel?.type,
            position: channel?.position,
            parent: channel?.parent?.id ?? null,
          }));

          logger?.info({
            message: 'getChannelsTool completed',
            meta: { channelCount: channelList.length },
          });

          return {
            summary: `Found ${channelList.length} channels in this server`,
            data: channelList,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { summary: `Failed to fetch channels: ${message}` };
        }
      },
    }),
  safetyLevel: 'low',
};
