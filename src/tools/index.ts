import { vcTools } from './vc';
import { channelTools } from './channel';
import { categoryTools } from './category';
import { roleTools } from './role';
import { memberTools } from './member';
import { messageTools } from './message';
import { serverTools } from './server';
import { reactionTools } from './reaction';
import { threadTools } from './thread';
import type { ToolFactory } from '@/tools/types';

/**
 * The Discord API tools.
 */
export const discordApiTools = {
  vcTools,
  channelTools,
  categoryTools,
  roleTools,
  memberTools,
  messageTools,
  serverTools,
  reactionTools,
  threadTools,
} satisfies Record<string, Record<string, ToolFactory>>;
