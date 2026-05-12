import { tool } from 'ai';
import z from 'zod';
import type { ToolFactory, ToolResult } from '@/tools/types';
import { auditLogTypesSchema, auditLogTypesToFlags } from '@/tools/shared/audit-log-types';

/**
 * Creates a tool factory for getting audit logs for the server.
 * @returns The tool factory.
 */
export const getAuditLogsTool: ToolFactory = {
  tool: ({ guild, logger }) =>
    tool({
      description: 'get audit logs for the server',
      inputSchema: z.object({
        types: auditLogTypesSchema,
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(10)
          .describe('how many audit logs to fetch (1-100)'),
        before: z.string().optional().describe('get audit logs before this audit log ID'),
        after: z.string().optional().describe('get audit logs after this audit log ID'),
      }),
      execute: async ({ types, limit, before, after }): Promise<ToolResult> => {
        try {
          logger?.info({
            message: 'getAuditLogsTool called',
            meta: { types, limit, before, after },
          });

          const options: Parameters<typeof guild.fetchAuditLogs>[0] = {
            type: auditLogTypesToFlags(types),
            limit,
          };

          if (before) options.before = before;
          if (after) options.after = after;

          const auditLogs = await guild.fetchAuditLogs(options);

          const list = auditLogs.entries.map((entry) => ({
            id: entry.id,
            action: entry.action,
            actionType: entry.actionType,
            reason: entry.reason,
            executor: entry.executor
              ? {
                  id: entry.executor.id,
                  username: entry.executor.username,
                  discriminator: entry.executor.discriminator,
                }
              : null,
            target: entry.target
              ? {
                  id: 'id' in entry.target ? entry.target.id : undefined,
                  type: 'type' in entry.target ? entry.target.type : undefined,
                }
              : null,
            changes: entry.changes,
            extra: entry.extra,
            createdTimestamp: entry.createdTimestamp,
          }));

          logger?.info({
            message: 'getAuditLogsTool completed',
            meta: { list },
          });

          return {
            summary: `Fetched audit logs (${list.length})`,
            data: list,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger?.error({
            message: 'getAuditLogsTool failed',
            meta: { types, limit, before, after },
            error: err instanceof Error ? err : new Error(message),
          });
          return { summary: `Failed to fetch audit logs: ${message}` };
        }
      },
    }),
  safetyLevel: 'mid',
};
