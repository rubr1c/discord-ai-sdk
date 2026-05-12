import { tool } from 'ai';
import type { RoleEditOptions } from 'discord.js';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';
import { permissionSchema, permissionsToFlags } from '@/tools/shared/role-permissions';

/**
 * Creates a tool factory to update a role.
 * @returns The tool factory.
 */
export const updateRoleTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: "Update an existing role's name, color, mentionable, or permissions",
      inputSchema: z.object({
        roleId: z.string().describe('ID of the role to update'),
        name: z.string().min(1).max(100).nullable().describe('New role name'),
        color: z
          .string()
          .regex(/^[0-9A-Fa-f]{6}$/)
          .nullable()
          .describe('Hex color without # (e.g., FF0000)'),
        mentionable: z.boolean().nullable().describe('Whether the role is mentionable'),
        permissions: permissionSchema,
      }),
      execute: async ({ roleId, name, color, mentionable, permissions }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'updateRoleTool called',
            meta: { roleId, name, color, mentionable, permissions },
          });

          const role = await guild.roles.fetch(roleId);
          if (!role) return { summary: `No role found for id ${roleId}.` };
          if (!role.editable)
            return { summary: `Insufficient permissions to update role ${role.name} (${roleId}).` };

          const updates: RoleEditOptions = {};

          if (name && name.trim() !== '') updates.name = name.trim();
          if (mentionable !== null) updates.mentionable = mentionable;
          if (color !== null) {
            updates.color = parseInt(color, 16);
          }
          if (permissions !== undefined) {
            updates.permissions = permissionsToFlags(permissions ?? undefined);
          }

          await role.edit(updates);

          const permLabel = permissions?.administrator
            ? 'Administrator (all permissions)'
            : permissions
              ? `${(updates.permissions as bigint[] | undefined)?.length ?? role.permissions.bitfield.toString().length} permissions`
              : 'unchanged permissions';

          logger?.info({
            message: 'updateRoleTool completed',
            meta: { roleId, name, color, mentionable, permissions },
          });

          return {
            summary: `Updated role ${role.name} (${role.id})${updates.name ? ` name→${updates.name}` : ''}${'color' in updates ? ` color→${updates.color}` : ''}${updates.mentionable !== undefined ? ` mentionable→${updates.mentionable}` : ''} (${permLabel})`,
            data: { id: role.id },
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'updateRoleTool failed',
            meta: { roleId, name, color, mentionable, permissions },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to update role ${roleId}: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
