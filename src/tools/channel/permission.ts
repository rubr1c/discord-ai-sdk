import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';
import { permissionOverwriteSchema, permissionsToFlags } from '@/tools/shared/role-permissions';

/**
 * Creates a tool factory for managing channel permissions.
 * @returns The tool factory.
 */
export const manageChannelPermissionsTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'manage channel permissions',
      inputSchema: z.object({
        channelId: z.string().describe('id of channel'),
        permissionOverwrites: permissionOverwriteSchema,
      }),
      execute: async ({ channelId, permissionOverwrites }): Promise<ToolResult> => {
        logger?.info({
          message: 'manageChannelPermissionsTool called',
          meta: { channelId, permissionOverwrites },
        });

        try {
          const channel = await guild.channels.fetch(channelId);

          if (!channel || !('permissionOverwrites' in channel)) {
            return { summary: `Channel ${channelId} does not support permission overwrites` };
          }

          const overwrites = permissionOverwrites?.map((o) => ({
            id: o.id,
            allow: permissionsToFlags(o.allow),
            deny: permissionsToFlags(o.deny),
          }));

          await channel.permissionOverwrites.set(overwrites ?? []);

          logger?.info({
            message: 'manageChannelPermissionsTool completed',
            meta: { channelId },
          });

          return { summary: `Updated permissions for channel ${channelId}` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'manageChannelPermissionsTool failed',
            meta: { channelId, permissionOverwrites },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to update permissions for channel ${channelId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
