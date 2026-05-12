import type { ToolFactory } from '../types';
import { getReactionsTool } from './fetch';
import { addReactionTool } from './add';
import { removeReactionTool } from './remove';

export const reactionTools = {
  getReactions: getReactionsTool,
  addReaction: addReactionTool,
  removeReaction: removeReactionTool,
} satisfies Record<string, ToolFactory>;
