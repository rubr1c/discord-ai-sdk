import { getMessagesTool } from './fetch';
import { sendMessageTool } from './send';
import { deleteMessageTool } from './delete';
import { pinMessageTool } from './pin';
import type { ToolFactory } from '@/tools/types';
import { editMessageTool } from './edit';

export const messageTools = {
  getMessages: getMessagesTool,
  sendMessage: sendMessageTool,
  deleteMessage: deleteMessageTool,
  pinMessage: pinMessageTool,
  editMessage: editMessageTool,
} satisfies Record<string, ToolFactory>;
