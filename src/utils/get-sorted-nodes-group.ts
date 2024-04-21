import { naturalSort, naturalSortCaseSensitive } from './natural-sort';
import type { PluginConfig } from '../plugin';
import type { ImportDeclaration } from '@babel/types';

export const getSortedNodesGroup = (
  imports: ImportDeclaration[],
  options?: Pick<PluginConfig, 'importOrderCaseSensitive'>,
) => {
  const { importOrderCaseSensitive } = options || {};
  const sortFn = importOrderCaseSensitive
    ? naturalSortCaseSensitive
    : naturalSort;
  return imports.sort((a, b) => sortFn(a.source.value, b.source.value));
};
