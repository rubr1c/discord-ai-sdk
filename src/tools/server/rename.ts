import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory to rename the server.
 * @returns The tool factory.
 */
export const setServerNameTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'Rename this Discord server (requires Manage Server permission).',
      inputSchema: z.object({
        name: z
          .string()
          .min(2, 'Server name must be at least 2 characters')
          .max(100, 'Server name must be at most 100 characters')
          .regex(/^[^\r\n]+$/, 'Server name cannot contain line breaks')
          .describe('New server name (2–100 chars)'),
      }),
      execute: async ({ name }): Promise<ToolResult> => {
        logger?.info({
          message: 'setServerNameTool called',
          meta: { name },
        });

        try {
          const newName = name.trim();

          if (newName === guild.name) {
            return { summary: `Server name is already '${newName}'.` };
          }

          await guild.setName(newName, 'Renamed by tool');
          logger?.info({
            message: 'setServerNameTool completed',
            meta: { name },
          });

          return { summary: `Renamed server to ${newName}` };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'setServerNameTool failed',
            meta: { name },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to rename server: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
