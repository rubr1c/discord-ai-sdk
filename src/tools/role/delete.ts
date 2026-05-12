import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to delete a role.
 * @returns The tool factory.
 */
export const deleteRoleTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'delete a role',
      inputSchema: z.object({
        id: z.string().describe('role id'),
      }),

      execute: async ({ id }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'deleteRoleTool called',
            meta: { id },
          });

          const role = await guild.roles.fetch(id);
          if (!role) {
            return { summary: `No role found for id ${id}.` };
          }

          if (role.id === guild.id) {
            logger?.info({
              message: 'deleteRoleTool completed',
              meta: { id },
            });

            return { summary: 'Cannot delete the @everyone role.' };
          }
          if (!role.editable) {
            logger?.info({
              message: 'deleteRoleTool completed',
              meta: { id },
            });

            return { summary: `Insufficient permissions to delete role ${role.name} (${id}).` };
          }
          const name = role.name;
          await role.delete();
          logger?.info({
            message: 'deleteRoleTool completed',
            meta: { id },
          });

          return { summary: `Deleted role ${name} (${id}).` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          if (message.includes('Unknown Role')) {
            logger?.info({
              message: 'deleteRoleTool completed',
              meta: { id },
            });

            return { summary: `Role ${id} not found.` };
          }
          logger?.info({
            message: 'deleteRoleTool completed',
            meta: { id },
          });

          return { summary: `Failed to delete role ${id}: ${message}` };
        }
      },
    }),
  safetyLevel: 'high',
};
