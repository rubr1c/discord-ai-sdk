import type { ToolFactory } from '@/tools/types';
import { getAuditLogsTool } from './audit-logs';
import { getBansTool } from './bans';
import { getEmojisTool } from './emojis';
import { getStickersTool } from './stickers';
import { getServerInfoTool } from './info';
import { setServerNameTool } from './rename';

export const serverTools = {
  getAuditLogs: getAuditLogsTool,
  getBans: getBansTool,
  getEmojis: getEmojisTool,
  getStickers: getStickersTool,
  getServerInfo: getServerInfoTool,
  setServerName: setServerNameTool,
} satisfies Record<string, ToolFactory>;
