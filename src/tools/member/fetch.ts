import { tool } from 'ai';
import { type FetchMembersOptions } from 'discord.js';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';

/**
 * Creates a tool factory for fetching members.
 * @returns The tool factory.
 */
export const getMembersTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'get a list of members with optional filtering and limits',
      inputSchema: z.object({
        limit: z
          .number()
          .int()
          .min(1)
          .max(1000)
          .default(100)
          .describe('number of members to fetch (1-1000)'),
        query: z
          .string()
          .optional()
          .describe('search members by username (case-insensitive partial match)'),
        withPresences: z
          .boolean()
          .default(false)
          .describe('include member presence information (online status, activities)'),
      }),
      execute: async ({ limit, query, withPresences }): Promise<ToolResult> => {
        logger?.info({
          message: 'getMembersTool called',
          meta: { limit, query, withPresences },
        });

        try {
          const fetchOptions: FetchMembersOptions = {
            limit,
            withPresences,
          };

          if (query) {
            fetchOptions.query = query;
          }

          const fetchedMembers = await guild.members.fetch(fetchOptions);

          const members = Array.from(fetchedMembers.values()).map((member) => ({
            bot: member.user.bot,
            username: member.user.username,
            displayName: member.displayName,
            id: member.user.id,
            joinedAt: member.joinedAt?.toISOString() || null,
            roles: Math.max(0, member.roles.cache.size - 1),
            status: withPresences ? member.presence?.status || 'offline' : undefined,
          }));

          logger?.info({
            message: 'getMembersTool completed',
            meta: { memberCount: members.length },
          });

          return {
            summary: `Found ${members.length} members${query ? ` matching "${query}"` : ''}`,
            data: members,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'getMembersTool failed',
            meta: { limit, query, withPresences },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to fetch members: ${message}` };
        }
      },
    }),
  safetyLevel: 'low',
};
