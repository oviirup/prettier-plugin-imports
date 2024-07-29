import { expect, test } from 'vitest';
import { explodeTypeAndValueSpecifiers } from './explode-type-and-value-specifiers';
import { getCodeFromAst } from './get-code-from-ast';
import { getImportNodes } from './get-import-nodes';

test('it should return a default value import unchanged', () => {
  const code = `import Default from './src';`;
  const importNodes = getImportNodes(code);
  const explodedNodes = explodeTypeAndValueSpecifiers(importNodes);
  const formatted = getCodeFromAst({
    nodesToOutput: explodedNodes,
    originalCode: code,
    directives: [],
  });
  expect(formatted).toEqual(`import Default from './src';`);
});

test('it should return a default value and namespace import unchanged', () => {
  const code = `import Default, * as Namespace from './src';`;
  const importNodes = getImportNodes(code);
  const explodedNodes = explodeTypeAndValueSpecifiers(importNodes);
  const formatted = getCodeFromAst({
    nodesToOutput: explodedNodes,
    originalCode: code,
    directives: [],
  });
  expect(formatted).toEqual(`import Default, * as Namespace from './src';`);
});

test('it should return default and namespaced value imports unchanged', () => {
  const code = `import Default, { named } from './src';`;
  const importNodes = getImportNodes(code);
  const explodedNodes = explodeTypeAndValueSpecifiers(importNodes);
  const formatted = getCodeFromAst({
    nodesToOutput: explodedNodes,
    originalCode: code,
    directives: [],
  });
  expect(formatted).toEqual(`import Default, { named } from './src';`);
});

test('it should return default type imports unchanged', () => {
  const code = `import type DefaultType from './src';`;
  const importNodes = getImportNodes(code, { plugins: ['typescript'] });
  const explodedNodes = explodeTypeAndValueSpecifiers(importNodes);
  const formatted = getCodeFromAst({
    nodesToOutput: explodedNodes,
    originalCode: code,
    directives: [],
  });
  expect(formatted).toEqual(`import type DefaultType from './src';`);
});

test('it should return namespace type imports unchanged', () => {
  const code = `import type * as NamespaceType from './src';`;
  const importNodes = getImportNodes(code, { plugins: ['typescript'] });
  const explodedNodes = explodeTypeAndValueSpecifiers(importNodes);
  const formatted = getCodeFromAst({
    nodesToOutput: explodedNodes,
    originalCode: code,
    directives: [],
  });
  expect(formatted).toEqual(`import type * as NamespaceType from './src';`);
});

test('it should return named type imports unchanged', () => {
  const code = `import type { NamedType1, NamedType2 } from './src';`;
  const importNodes = getImportNodes(code, { plugins: ['typescript'] });
  const explodedNodes = explodeTypeAndValueSpecifiers(importNodes);
  const formatted = getCodeFromAst({
    nodesToOutput: explodedNodes,
    originalCode: code,
    directives: [],
  });
  expect(formatted).toEqual(
    `import type { NamedType1, NamedType2 } from './src';`,
  );
});

test('it should return inline named type imports unchanged', () => {
  const code = `import { type NamedType1, type NamedType2 } from './source';`;
  const importNodes = getImportNodes(code, { plugins: ['typescript'] });
  const explodedNodes = explodeTypeAndValueSpecifiers(importNodes);
  const formatted = getCodeFromAst({
    nodesToOutput: explodedNodes,
    originalCode: code,
    directives: [],
  });
  expect(formatted).toEqual(
    `import { type NamedType1, type NamedType2 } from './source';`,
  );
});

test('it should separate named type and value imports', () => {
  const code = `import { named, type NamedType } from './src';`;
  const importNodes = getImportNodes(code, { plugins: ['typescript'] });
  const explodedNodes = explodeTypeAndValueSpecifiers(importNodes);
  const formatted = getCodeFromAst({
    nodesToOutput: explodedNodes,
    originalCode: code,
    directives: [],
  });
  expect(formatted).toEqual(
    `import { named } from './src';
import type { NamedType } from './src';`,
  );
});

test('it should separate named type and default value imports', () => {
  const code = `import Default, { type NamedType } from './src';`;
  const importNodes = getImportNodes(code, { plugins: ['typescript'] });
  const explodedNodes = explodeTypeAndValueSpecifiers(importNodes);
  const formatted = getCodeFromAst({
    nodesToOutput: explodedNodes,
    originalCode: code,
    directives: [],
  });
  expect(formatted).toEqual(
    `import Default from './src';
import type { NamedType } from './src';`,
  );
});

test('it should separate named type and default and named value imports', () => {
  const code = `import Default, { named, type NamedType } from './src';`;
  const importNodes = getImportNodes(code, { plugins: ['typescript'] });
  const explodedNodes = explodeTypeAndValueSpecifiers(importNodes);
  const formatted = getCodeFromAst({
    nodesToOutput: explodedNodes,
    originalCode: code,
    directives: [],
  });
  expect(formatted).toEqual(
    `import Default, { named } from './src';
import type { NamedType } from './src';`,
  );
});
