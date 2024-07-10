import { builtinModules } from 'module';
import { expressionStatement, stringLiteral } from '@babel/types';
import type { ParserPlugin } from '@babel/parser';

export const flow: ParserPlugin = 'flow';
export const typescript: ParserPlugin = 'typescript';
export const jsx: ParserPlugin = 'jsx';

export const newLineCharacters = '\n\n';

export const chunkTypeUnsortable = 'unsortable';
export const chunkTypeOther = 'other';

/**
 * Value imports (including top-level default imports)\
 * `- import {Thing} from ...` or\
 * `import Thing from ...`
 */
export const importFlavorValue = 'value';
/** Import type {} from ... */
export const importFlavorType = 'type';
export const importFlavorSideEffect = 'side-effect';
export const importFlavorIgnore = 'prettier-ignore';
export const mergeableImportFlavors = [
  importFlavorValue,
  importFlavorType,
] as const;

export const _BUILTIN_MODULES_RGX = `^(?:node:)?(?:${builtinModules.join(
  '|',
)})$`;

export const _BUILTIN_MODULES = '<BUILTIN_MODULES>';
export const _THIRD_PARTY_MODULES = '<THIRD_PARTY_MODULES>';
export const _TYPES_MODULES = '<TYPES>';

const _NEW_LINE = 'PRETTIER_PLUGIN_IMPORTS_NEW_LINE';

/**
 * Use this to force a newline at top-level scope (good for newlines generated
 * between import blocks)
 */
export const newLineNode = expressionStatement(stringLiteral(_NEW_LINE));
/**
 * Use this if you want to force a newline, but you're attaching to
 * leading/inner/trailing Comments
 */
export const forceANewlineUsingACommentStatement = () => ({
  type: 'CommentLine' as const,
  value: 'PRETTIER_PLUGIN_IMPORTS_NEWLINE_COMMENT',
  start: -1,
  end: -1,
  loc: { start: { line: -1, column: -1 }, end: { line: -1, column: -1 } },
});

export const injectNewlinesRegex =
  /("PRETTIER_PLUGIN_IMPORTS_NEW_LINE";|\/\/PRETTIER_PLUGIN_IMPORTS_NEWLINE_COMMENT)/gi;
