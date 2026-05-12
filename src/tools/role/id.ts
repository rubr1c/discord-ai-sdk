import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to fetch role id from role name.
 * @returns The tool factory.
 */
export const getRoleIdTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'fetch role id from role name',
      inputSchema: z.object({
        name: z.string().describe('name of target role'),
      }),
      execute: async ({ name }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'getRoleIdTool called',
            meta: { name },
          });

          const role = (await guild.roles.fetch()).find((role) => role.name === name);

          logger?.info({
            message: 'getRoleIdTool completed',
            meta: { name, role },
          });

          return { summary: `${name}: ${role?.id ?? 'not found'}`, data: { id: role?.id ?? null } };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'getRoleIdTool failed',
            meta: { name },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to fetch role id from role name: ${message}` };
        }
      },
    }),
  safetyLevel: 'low',
};
