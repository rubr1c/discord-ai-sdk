import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to fetch existing roles.
 * @returns The tool factory.
 */
export const getRolesTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'fetch existing roles (name, color, id)',
      inputSchema: z.object({}),
      execute: async (): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'getRolesTool called',
          });

          const roles = await guild.roles.fetch();
          const roleList = roles.map((role) => ({
            name: role.name,
            color: role.color,
            id: role.id,
          }));

          logger?.info({
            message: 'getRolesTool completed',
            meta: { roleList },
          });

          return {
            summary: `Found ${roleList.length} roles in this server`,
            data: roleList,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'getRolesTool failed',
            meta: { message },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to fetch roles: ${message}` };
        }
      },
    }),
  safetyLevel: 'low',
};
