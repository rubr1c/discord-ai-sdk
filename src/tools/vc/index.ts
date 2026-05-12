import { disconnectMemberTool } from './disconnect';
import { deafenMemberTool } from './deafen';
import { moveMemberTool } from './move';
import { muteMemberTool } from './mute';
import type { ToolFactory } from '@/tools/types';

export const vcTools = {
  moveMember: moveMemberTool,
  muteMember: muteMemberTool,
  deafenMember: deafenMemberTool,
  disconnectMember: disconnectMemberTool,
} satisfies Record<string, ToolFactory>;
