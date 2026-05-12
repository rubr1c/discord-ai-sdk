import { getMessagesTool } from './fetch';
import { sendMessageTool } from './send';
import { deleteMessageTool } from './delete';
import { pinMessageTool } from './pin';
import type { ToolFactory } from '@/tools/types';

export const messageTools = {
  getMessages: getMessagesTool,
  sendMessage: sendMessageTool,
  deleteMessage: deleteMessageTool,
  pinMessage: pinMessageTool,
} satisfies Record<string, ToolFactory>;
