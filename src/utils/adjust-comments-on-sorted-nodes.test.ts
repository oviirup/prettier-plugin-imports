import { expect, test } from 'vitest';
import { adjustCommentsOnSortedNodes } from './adjust-comments-on-sorted-nodes';
import { getImportNodes } from './get-import-nodes';
import type { CommentAttachmentOptions, ImportOrLine } from '../types';

function leadingComments(node: ImportOrLine): string[] {
  return node.leadingComments?.map((c) => c.value) ?? [];
}

function trailingComments(node: ImportOrLine): string[] {
  return node.trailingComments?.map((c) => c.value) ?? [];
}

const defaultAttachmentOptions: CommentAttachmentOptions = {};

test('it preserves the single leading comment for each import declaration', () => {
  const importNodes = getImportNodes(`
    import {x} from "c";
    // comment b
    import {y} from "b";
    // comment a
    import {z} from "a";
    `);
  expect(importNodes).toHaveLength(3);
  const finalNodes = [importNodes[2], importNodes[1], importNodes[0]];
  const adjustedNodes = adjustCommentsOnSortedNodes(
    importNodes,
    finalNodes,
    defaultAttachmentOptions,
  );
  expect(adjustedNodes).toHaveLength(3);
  expect(leadingComments(adjustedNodes[0])).toEqual([' comment a']);
  expect(trailingComments(adjustedNodes[0])).toEqual([]);
  expect(leadingComments(adjustedNodes[1])).toEqual([' comment b']);
  expect(trailingComments(adjustedNodes[1])).toEqual([]);
  // Import from "c" has no leading comment, and the trailing was kept with "b"
  expect(leadingComments(adjustedNodes[2])).toEqual([]);
  expect(trailingComments(adjustedNodes[2])).toEqual([]);
});

test('it preserves multiple leading comments for each import declaration', () => {
  const importNodes = getImportNodes(`
    import {x} from "c";
    // comment b1
    // comment b2
    // comment b3
    import {y} from "b";
    // comment a1
    // comment a2
    // comment a3
    import {z} from "a";
    `);
  expect(importNodes).toHaveLength(3);
  const finalNodes = [importNodes[2], importNodes[1], importNodes[0]];
  const adjustedNodes = adjustCommentsOnSortedNodes(
    importNodes,
    finalNodes,
    defaultAttachmentOptions,
  );
  expect(adjustedNodes).toHaveLength(3);
  expect(leadingComments(adjustedNodes[0])).toEqual([
    ' comment a1',
    ' comment a2',
    ' comment a3',
  ]);
  expect(trailingComments(adjustedNodes[0])).toEqual([]);
  expect(leadingComments(adjustedNodes[1])).toEqual([
    ' comment b1',
    ' comment b2',
    ' comment b3',
  ]);
  expect(trailingComments(adjustedNodes[1])).toEqual([]);
  expect(leadingComments(adjustedNodes[2])).toEqual([]);
  expect(trailingComments(adjustedNodes[2])).toEqual([]);
});

test('it does not move comments more than one line before all import declarations', () => {
  const importNodes = getImportNodes(`
    // comment c1
    // comment c2
    import {x} from "c";
    import {y} from "b";
    import {z} from "a";
    `);
  expect(importNodes).toHaveLength(3);
  const finalNodes = [importNodes[2], importNodes[1], importNodes[0]];
  const adjustedNodes = adjustCommentsOnSortedNodes(
    importNodes,
    finalNodes,
    defaultAttachmentOptions,
  );
  expect(adjustedNodes).toHaveLength(4);
  // Comment c1 is above the first import, so it stays with the top-of-file attached to a dummy statement
  expect(adjustedNodes[0].type).toEqual('EmptyStatement');
  expect(trailingComments(adjustedNodes[0])).toEqual([
    ' comment c1',
    ' comment c2',
  ]);

  expect(leadingComments(adjustedNodes[2])).toEqual([]);
  expect(trailingComments(adjustedNodes[2])).toEqual([]);
  expect(trailingComments(adjustedNodes[3])).toEqual([]);
});

test('it does not affect comments after all import declarations', () => {
  const importNodes = getImportNodes(`
    import {x} from "c";
    import {y} from "b";
    import {z} from "a";
    // comment final 1
    // comment final 2
    `);
  expect(importNodes).toHaveLength(3);
  const finalNodes = [importNodes[2], importNodes[1], importNodes[0]];
  const adjustedNodes = adjustCommentsOnSortedNodes(
    importNodes,
    finalNodes,
    defaultAttachmentOptions,
  );
  expect(adjustedNodes).toHaveLength(3);
  expect(leadingComments(adjustedNodes[0])).toEqual([]);
  expect(trailingComments(adjustedNodes[0])).toEqual([]);
  expect(leadingComments(adjustedNodes[1])).toEqual([]);
  expect(trailingComments(adjustedNodes[1])).toEqual([]);
  expect(leadingComments(adjustedNodes[2])).toEqual([]);
  expect(trailingComments(adjustedNodes[2])).toEqual([]);
});
