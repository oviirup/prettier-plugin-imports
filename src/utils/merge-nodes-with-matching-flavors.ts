import assert from 'assert';
import {
  importFlavorType,
  importFlavorValue,
  mergeableImportFlavors,
} from '../constants';
import { getImportFlavorOfNode } from './get-import-flavor-of-node';
import type { MergeNodesWithMatchingImportFlavors } from '../types';
import type {
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
} from '@babel/types';

type MergeableFlavor = (typeof mergeableImportFlavors)[number];
function isMergeableFlavor(flavor: string): flavor is MergeableFlavor {
  return mergeableImportFlavors.includes(flavor as MergeableFlavor);
}

/**
 * Builds an object map of import declarations which can be merged together,
 * grouped by whether they are type or value import declarations.
 */
function selectMergeableNodesByImportFlavor(
  nodes: ImportDeclaration[],
): Record<MergeableFlavor, ImportDeclaration[]> {
  return nodes.reduce<
    Record<(typeof mergeableImportFlavors)[number], ImportDeclaration[]>
  >(
    (groups, node) => {
      const flavor = getImportFlavorOfNode(node);
      if (isMergeableFlavor(flavor)) {
        groups[flavor].push(node);
      }
      return groups;
    },
    {
      [importFlavorValue]: [],
      [importFlavorType]: [],
    },
  );
}
/**
 * Returns the "source" (i.e. module name or path) of an import declaration
 *
 * E.g.: `import foo from "./foo";` -- "./foo" is the source.
 */
function selectNodeImportSource(node: ImportDeclaration) {
  return node.source.value;
}

/** E.g. import * as Namespace from "someModule" */
function nodeIsImportNamespaceSpecifier(
  node: ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier,
): node is ImportNamespaceSpecifier {
  return node.type === 'ImportNamespaceSpecifier';
}
/**
 * Default type or value import
 *
 * E.g. import Default from "someModule" import type Default from "someModule"
 */
function nodeIsImportDefaultSpecifier(
  node: ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier,
): node is ImportDefaultSpecifier {
  return node.type === 'ImportDefaultSpecifier';
}
function nodeIsImportSpecifier(
  node: ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier,
): node is ImportSpecifier {
  return node.type === 'ImportSpecifier';
}

function convertImportSpecifierToType(node: ImportSpecifier) {
  assert(
    node.importKind === 'value' ||
      node.importKind === 'type' ||
      // importKind can be null when using Flow
      node.importKind === null,
  );
  node.importKind = 'type';
}

/** Pushes an `import type` expression into `import { type …}` */
function convertTypeImportToValueImport(node: ImportDeclaration) {
  assert(node.importKind === 'type');
  node.importKind = 'value';
  node.specifiers
    .filter(nodeIsImportSpecifier)
    .forEach(convertImportSpecifierToType);
}

/** Return false if the merge will produce an invalid result */
function mergeIsSafe(
  nodeToKeep: ImportDeclaration,
  nodeToForget: ImportDeclaration,
) {
  if (
    nodeToKeep.specifiers.some(nodeIsImportNamespaceSpecifier) ||
    nodeToForget.specifiers.some(nodeIsImportNamespaceSpecifier)
  ) {
    // An `import * as Foo` namespace specifier cannot be merged
    //   with other import expressions.
    return false;
  }
  if (
    nodeToKeep.specifiers.some(nodeIsImportDefaultSpecifier) &&
    nodeToForget.specifiers.some(nodeIsImportDefaultSpecifier)
  ) {
    // Two `import Foo from` specifiers cannot be merged trivially.
    // -- Notice: this is *not* import {default as Foo1, default as Foo2} -- that's legal!
    //
    // Future work could convert `import Foo1 from 'a'; import Foo2 from 'a';
    //  into `import {default as Foo1, default as Foo2} from 'a';`
    // But since this runs the risk of making code longer, this won't be in v1.
    return false;
  }
  if (
    (nodeToKeep.importKind === 'type' &&
      nodeToKeep.specifiers.some(nodeIsImportDefaultSpecifier)) ||
    (nodeToForget.importKind === 'type' &&
      nodeToForget.specifiers.some(nodeIsImportDefaultSpecifier))
  ) {
    // Cannot merge default type imports (.e.g. import type React from 'react')
    return false;
  }
  return true;
}

/**
 * Mutates the modeToKeep, adding the import specifiers and comments from the
 * nodeToForget.
 *
 * @returns (node to keep if we should delete the other node | null to keep
 *   everything)
 */
function mergeNodes(
  nodeToKeep: ImportDeclaration,
  nodeToForget: ImportDeclaration,
) {
  if (!mergeIsSafe(nodeToKeep, nodeToForget)) {
    return null;
  }

  if (nodeToKeep.importKind === 'type' && nodeToForget.importKind === 'value') {
    convertTypeImportToValueImport(nodeToKeep);
  } else if (
    nodeToKeep.importKind === 'value' &&
    nodeToForget.importKind === 'type'
  ) {
    convertTypeImportToValueImport(nodeToForget);
  }

  nodeToKeep.specifiers.push(...nodeToForget.specifiers);

  // These mutations don't update the line numbers, and that's crucial for moving things around.
  // To get updated line-numbers you would need to re-parse the code after these changes are rendered!
  nodeToKeep.leadingComments = [
    ...(nodeToKeep.leadingComments || []),
    ...(nodeToForget.leadingComments || []),
  ];
  nodeToKeep.innerComments = [
    ...(nodeToKeep.innerComments || []),
    ...(nodeToForget.innerComments || []),
  ];
  nodeToKeep.trailingComments = [
    ...(nodeToKeep.trailingComments || []),
    ...(nodeToForget.trailingComments || []),
  ];

  return nodeToKeep;
}

/**
 * Modifies context, deleteContext, case A: context has no node for an import
 * source, then it's assigned. case B: context has a node for an import source,
 * then it's merged, and old node is added to deleteContext.
 */
function mutateContextAndMerge({
  context,
  nodesToDelete,
  insertableNode,
}: {
  context: Record<string, ImportDeclaration>;
  nodesToDelete: ImportDeclaration[];
  insertableNode: ImportDeclaration;
}) {
  const source = selectNodeImportSource(insertableNode);
  const existing = context[source];

  if (existing) {
    // Check if the existing is after the new one in the code.
    // If so, we reverse the keep/delete so that the first node is kept.
    // Important for top-of-file comment formatting.
    if (
      existing.start &&
      insertableNode.start &&
      existing.start > insertableNode.start
    ) {
      const merged = mergeNodes(insertableNode, existing);
      if (merged) {
        nodesToDelete.push(existing);
        context[source] = merged;
      }
    } else {
      if (mergeNodes(existing, insertableNode)) {
        nodesToDelete.push(insertableNode);
      }
    }
  } else {
    context[source] = insertableNode;
  }
}

/**
 * Accepts an array of nodes from a given chunk, and merges candidates that have
 * a matching import-flavor
 *
 * In other words each group will be merged if they have the same source:
 *
 * - `import type` expressions from the same source
 * - `import Name, {a, b}` from the same source
 *
 * `import type {Foo}` expressions won't be converted into `import {type Foo}`
 * or vice versa
 */
export const mergeNodesWithMatchingImportFlavors: MergeNodesWithMatchingImportFlavors =
  (input, { importOrderCombineTypeAndValueImports }) => {
    const nodesToDelete: ImportDeclaration[] = [];

    let context: Record<string, ImportDeclaration> = {};
    const groups = selectMergeableNodesByImportFlavor(input);
    for (const groupKey of mergeableImportFlavors) {
      if (!importOrderCombineTypeAndValueImports) {
        // Reset in loop to avoid unintended merge across variants
        context = {};
      }
      const group = groups[groupKey as keyof typeof groups];

      for (const insertableNode of group) {
        mutateContextAndMerge({
          context,
          nodesToDelete,
          insertableNode,
        });
      }
    }

    return input.filter((n) => !nodesToDelete.includes(n));
  };
