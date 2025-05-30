import { expect, test } from 'vitest';
import { DEFAULT_IMPORT_ORDER } from '../constants';
import { getImportNodes } from './get-import-nodes';
import { getSortedNodes } from './get-sorted-nodes';
import { getSortedNodesModulesNames } from './get-sorted-nodes-modules-names';
import { getSortedNodesNamesAndNewlines } from './get-sorted-nodes-names-and-newlines';
import { testingOnly } from './normalize-plugin-options';
import type { ImportDeclaration } from '@babel/types';

const code = `
import "se3";
import z from 'z';
import c, { cD } from 'c';
import g from 'g';
import { tC, tA, tB } from 't';
import k, { kE, kB } from 'k';
import "se4";
import "se1";
import * as a from 'a';
import * as x from 'x';
import path from 'path';
import BY from 'BY';
import Ba from 'Ba';
import XY from 'XY';
import Xa from 'Xa';
import "se2";
`;

test('it returns all sorted nodes, preserving the order side effect nodes', () => {
  const result = getImportNodes(code);
  const sorted = getSortedNodes(result, {
    importOrder: testingOnly.normalizeImportOrderOption(DEFAULT_IMPORT_ORDER),
    importOrderCombineTypeAndValueImports: true,
  }) as ImportDeclaration[];
  expect(getSortedNodesNamesAndNewlines(sorted)).toEqual([
    'se3',
    'c',
    'g',
    'k',
    't',
    'z',
    'se4',
    'se1',
    'path', // Builtins are not sorted past side-effects either
    'a',
    'Ba',
    'BY',
    'x',
    'Xa',
    'XY',
    'se2',
    '',
  ]);

  const result2 = sorted
    .filter((node) => node.type === 'ImportDeclaration')
    .map((importDeclaration) =>
      getSortedNodesModulesNames(importDeclaration.specifiers),
    );

  expect(result2).toEqual([
    [],
    ['c', 'cD'],
    ['g'],
    ['k', 'kB', 'kE'],
    ['tA', 'tB', 'tC'],
    ['z'],
    [],
    [],
    ['path'],
    ['a'],
    ['Ba'],
    ['BY'],
    ['x'],
    ['Xa'],
    ['XY'],
    [],
  ]);
});
