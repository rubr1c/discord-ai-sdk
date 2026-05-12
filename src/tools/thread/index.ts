import type { ToolFactory } from '@/tools/types';
import { createThreadTool } from './create';
import { getThreadsTool } from './fetch';
import { deleteThreadTool } from './delete';
import { archiveThreadTool } from './archive';

export const threadTools = {
  createThread: createThreadTool,
  deleteThread: deleteThreadTool,
  archiveThread: archiveThreadTool,
  getThreads: getThreadsTool,
} satisfies Record<string, ToolFactory>;
