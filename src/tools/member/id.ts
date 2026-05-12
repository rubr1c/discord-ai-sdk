import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory for fetching user id from username.
 * @returns The tool factory.
 */
export const getUserIdTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'fetch user id from username',
      inputSchema: z.object({
        username: z.string().describe('username of tagert'),
      }),
      execute: async ({ username }): Promise<ToolResult> => {
        logger?.info({
          message: 'getUserIdTool called',
          meta: { username },
        });

        try {
          const q = username.trim();

          const idMatch = q.match(/^<@!?(\d{17,20})>$|^(\d{17,20})$/);
          if (idMatch) {
            const id = idMatch[1] ?? idMatch[2] ?? '';
            const member = await guild.members.fetch(id);
            return { summary: `${member.user.username}: ${member.id}`, data: { id: member.id } };
          }

          const lower = q.toLowerCase();
          const memberFromCache = guild.members.cache.find(
            (m) =>
              m.user.username.toLowerCase() === lower ||
              m.displayName.toLowerCase() === lower ||
              (m.user.globalName?.toLowerCase?.() ?? '') === lower,
          );
          if (memberFromCache) {
            logger?.info({
              message: 'getUserIdTool completed',
              meta: { id: memberFromCache.id },
            });

            return {
              summary: `${memberFromCache.user.username}: ${memberFromCache.id}`,
              data: { id: memberFromCache.id },
            };
          }

          return { summary: `${q}: not found` };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'getUserIdTool failed',
            meta: { username },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `error: ${message}` };
        }
      },
    }),
  safetyLevel: 'low',
};
