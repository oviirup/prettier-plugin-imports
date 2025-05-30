import generate from '@babel/generator';
import { file } from '@babel/types';
import { injectNewlinesRegex, newLineCharacters } from '../constants';
import { getAllCommentsFromNodes } from './get-all-comments-from-nodes';
import { removeNodesFromOriginalCode } from './remove-nodes-from-original-code';
import type { Directive, InterpreterDirective, Statement } from '@babel/types';

/**
 * This function generates a code string from the passed nodes.
 *
 * @param nodesToOutput The remaining imports which should be rendered. (Node
 *   specifiers & types may be mutated)
 * @param allOriginalImportNodes All import nodes that were originally relevant.
 *   (This includes nodes that need to be deleted!)
 * @param originalCode The original input code that was passed to this plugin.
 * @param directives All directive prologues from the original code (e.g. `"use
 *   strict";`).
 * @param interpreter Optional interpreter directives, if present (e.g.
 *   `#!/bin/node`).
 */
export const getCodeFromAst = ({
  nodesToOutput,
  allOriginalImportNodes = nodesToOutput,
  originalCode,
  directives,
  interpreter,
}: {
  nodesToOutput: Statement[];
  allOriginalImportNodes?: Statement[];
  originalCode: string;
  directives: Directive[];
  interpreter?: InterpreterDirective | null;
}) => {
  const allCommentsFromImports = getAllCommentsFromNodes(nodesToOutput);
  const allCommentsFromDirectives = getAllCommentsFromNodes(directives);
  const allCommentsFromInterpreter = interpreter
    ? getAllCommentsFromNodes([interpreter])
    : [];

  const nodesToRemoveFromCode = [
    ...nodesToOutput,
    ...allOriginalImportNodes,
    ...allCommentsFromImports,
    ...allCommentsFromDirectives,
    ...allCommentsFromInterpreter,
    ...(interpreter ? [interpreter] : []),
    ...directives,
  ];

  const codeWithoutImportsAndInterpreter = removeNodesFromOriginalCode(
    originalCode,
    nodesToRemoveFromCode,
  );

  const newAST = file({
    type: 'Program',
    body: nodesToOutput,
    directives: directives,
    sourceType: 'module',
    interpreter: interpreter,
    leadingComments: [],
    innerComments: [],
    trailingComments: [],
    start: 0,
    end: 0,
    loc: {
      start: { line: 0, column: 0, index: 0 },
      end: { line: 0, column: 0, index: 0 },
      filename: '',
      identifierName: '',
    },
  });

  const { code } = generate(newAST, { importAttributesKeyword: 'with' });

  const replacedCode = code.replace(injectNewlinesRegex, newLineCharacters);

  const trailingCode = codeWithoutImportsAndInterpreter.trim();

  return replacedCode + trailingCode;
};
