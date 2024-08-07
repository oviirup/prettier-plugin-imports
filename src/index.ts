import { parsers as babelParsers } from 'prettier/parser-babel';
import { parsers as flowParsers } from 'prettier/parser-flow';
import { parsers as htmlParsers } from 'prettier/parser-html';
import { parsers as typescriptParsers } from 'prettier/parser-typescript';
import { _BUILTIN_MODULES, _THIRD_PARTY_MODULES } from './constants';
import { defaultPreprocessor } from './preprocessors/default';
import { vuePreprocessor } from './preprocessors/vue';
import type { PrettierOptions } from './types';
import type { RequiredOptions } from 'prettier';

// Not sure what the type from Prettier should be, but this is a good enough start.
interface PrettierOptionSchema {
  type: string;
  category: 'Global';
  array?: boolean;
  default: unknown;
  description: string;
}

const defaultImportOrder = [
  _BUILTIN_MODULES,
  _THIRD_PARTY_MODULES, // Everything not matching relative imports
  '^[.]', // relative imports
];

export const options: Record<
  Exclude<keyof PrettierOptions, keyof RequiredOptions>,
  PrettierOptionSchema
> = {
  importOrder: {
    type: 'path',
    category: 'Global',
    array: true,
    default: [{ value: defaultImportOrder }],
    description: 'Provide an order to sort imports',
  },
  importOrderParsers: {
    type: 'path',
    category: 'Global',
    array: true,
    // By default, we add ts and jsx as parsers but if users define something
    // we take that option
    default: [{ value: ['typescript', 'jsx'] }],
    description: 'Provide a list of plugins for special syntax',
  },
  importOrderTSVersion: {
    type: 'string',
    category: 'Global',
    default: '1.0.0',
    description:
      'Version of TypeScript in use in the project.  Determines some output syntax when using TypeScript.',
  },
};

export const parsers = {
  babel: {
    ...babelParsers.babel,
    preprocess: defaultPreprocessor,
  },
  'babel-ts': {
    ...babelParsers['babel-ts'],
    preprocess: defaultPreprocessor,
  },
  flow: {
    ...flowParsers.flow,
    preprocess: defaultPreprocessor,
  },
  typescript: {
    ...typescriptParsers.typescript,
    preprocess: defaultPreprocessor,
  },
  vue: {
    ...htmlParsers.vue,
    preprocess: vuePreprocessor,
  },
};
