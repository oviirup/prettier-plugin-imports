import { SomeSpecifier } from '../types';
import type {
  CommentBlock,
  CommentLine,
  Directive,
  InterpreterDirective,
  Statement,
} from '@babel/types';

export const getAllCommentsFromNodes = (
  nodes: readonly (
    | Directive
    | Statement
    | SomeSpecifier
    | InterpreterDirective
  )[],
) =>
  nodes.reduce(
    (acc, node) => {
      if (
        Array.isArray(node.leadingComments) &&
        node.leadingComments.length > 0
      ) {
        acc = [...acc, ...node.leadingComments];
      }
      if (Array.isArray(node.innerComments) && node.innerComments.length > 0) {
        acc = [...acc, ...node.innerComments];
      }
      if (
        Array.isArray(node.trailingComments) &&
        node.trailingComments.length > 0
      ) {
        acc = [...acc, ...node.trailingComments];
      }
      if (node.type === 'ImportDeclaration') {
        acc = [...acc, ...getAllCommentsFromNodes(node.specifiers)];
      }
      return acc;
    },
    [] as (CommentBlock | CommentLine)[],
  );
