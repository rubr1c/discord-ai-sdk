import type { ToolFactory } from '@/tools/types';
import { getMembersTool } from './fetch';
import { kickMemberTool } from './kick';
import { banMemberTool } from './ban';
import { timeoutMemberTool } from './timeout';
import { getUserIdTool } from './id';
import { nicknameMemberTool } from './nickname';

export const memberTools = {
  getMembers: getMembersTool,
  kickMember: kickMemberTool,
  banMember: banMemberTool,
  timeoutMember: timeoutMemberTool,
  getUserId: getUserIdTool,
  setNickname: nicknameMemberTool,
} satisfies Record<string, ToolFactory>;
