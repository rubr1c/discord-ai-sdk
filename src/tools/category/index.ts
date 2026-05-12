import type { ToolFactory } from '@/tools/types';
import { createCategoryTool } from './create';
import { getCategoriesTool } from './fetch';
import { deleteCategoryTool } from './delete';

export const categoryTools = {
  createCategory: createCategoryTool,
  getCategories: getCategoriesTool,
  deleteCategory: deleteCategoryTool,
} satisfies Record<string, ToolFactory>;
