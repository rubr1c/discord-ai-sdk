import { assignRoleTool } from './assign';
import { createRoleTool } from './create';
import { deleteRoleTool } from './delete';
import { getRolesTool } from './fetch';
import { removeRoleTool } from './remove';
import { updateRoleTool } from './update';
import { getRoleIdTool } from './id';
import type { ToolFactory } from '@/tools/types';

export const roleTools = {
  createRole: createRoleTool,
  getRoles: getRolesTool,
  deleteRole: deleteRoleTool,
  updateRole: updateRoleTool,
  assignRole: assignRoleTool,
  removeRole: removeRoleTool,
  getRoleId: getRoleIdTool,
} satisfies Record<string, ToolFactory>;
