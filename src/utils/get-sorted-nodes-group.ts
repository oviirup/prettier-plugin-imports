import { naturalSort } from './natural-sort';
import type { ImportDeclaration } from '@babel/types';

export const getSortedNodesGroup = (imports: ImportDeclaration[]) => {
  return imports.sort((a, b) => naturalSort(a.source.value, b.source.value));
};
