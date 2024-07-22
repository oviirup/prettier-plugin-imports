import { describe, expect, test } from 'vitest';
import {
  _BUILTIN_MODULES,
  _BUILTIN_MODULES_RGX,
  _THIRD_PARTY_MODULES,
} from '../constants';
import { NormalizableOptions } from '../types';
import {
  examineAndNormalizePluginOptions,
  testingOnly,
} from './normalize-plugin-options';

describe('normalizeImportOrder', () => {
  test('it should inject required modules if not present', () => {
    expect(testingOnly.normalizeImportOrder([])).toEqual([
      _BUILTIN_MODULES_RGX,
      _THIRD_PARTY_MODULES,
    ]);
    expect(testingOnly.normalizeImportOrder(['^[.]'])).toEqual([
      _BUILTIN_MODULES_RGX,
      _THIRD_PARTY_MODULES,
      '^[.]',
    ]);
    expect(
      testingOnly.normalizeImportOrder(['<THIRD_PARTY_MODULES>', '^[.]']),
    ).toEqual([_BUILTIN_MODULES_RGX, _THIRD_PARTY_MODULES, '^[.]']);
    expect(
      testingOnly.normalizeImportOrder(['<BUILTIN_MODULES>', '^[.]']),
    ).toEqual([_THIRD_PARTY_MODULES, _BUILTIN_MODULES_RGX, '^[.]']);

    expect(
      testingOnly.normalizeImportOrder([
        '<BUILTIN_MODULES>',
        '<THIRD_PARTY_MODULES>',
        '^[.]',
      ]),
    ).toEqual([_BUILTIN_MODULES_RGX, _THIRD_PARTY_MODULES, '^[.]']);
  });
  test('it should inject required modules *after the first-separator& if any are present', () => {
    expect(testingOnly.normalizeImportOrder([''])).toEqual([
      '',
      _BUILTIN_MODULES_RGX,
      _THIRD_PARTY_MODULES,
    ]);
    expect(
      testingOnly.normalizeImportOrder([
        '',
        '<BUILTIN_MODULES>',
        '<THIRD_PARTY_MODULES>',
      ]),
    ).toEqual(['', _BUILTIN_MODULES_RGX, _THIRD_PARTY_MODULES]);
    expect(testingOnly.normalizeImportOrder([' '])).toEqual([
      ' ',
      _BUILTIN_MODULES_RGX,
      _THIRD_PARTY_MODULES,
    ]);
    expect(testingOnly.normalizeImportOrder(['', '', '^[.]'])).toEqual([
      '',
      _BUILTIN_MODULES_RGX,
      _THIRD_PARTY_MODULES,
      '',
      '^[.]',
    ]);
  });
});

describe('examineAndNormalizePluginOptions', () => {
  test('it should set most defaults', () => {
    expect(
      examineAndNormalizePluginOptions({
        importOrder: [],
        importOrderParsers: [],
        importOrderTSVersion: '1.0.0',
        filepath: __filename,
      } as NormalizableOptions),
    ).toEqual({
      hasSeparator: false,
      importOrder: [_BUILTIN_MODULES_RGX, _THIRD_PARTY_MODULES],
      combineTypesAndImports: true,
      plugins: [],
      leadingSeparator: false,
    });
  });
  test('it should detect group separators anywhere (relevant for side-effects)', () => {
    expect(
      examineAndNormalizePluginOptions({
        importOrder: [_BUILTIN_MODULES, _THIRD_PARTY_MODULES, '', '^[./]'],
        importOrderParsers: [],
        importOrderTSVersion: '1.0.0',
        filepath: __filename,
      } as NormalizableOptions),
    ).toEqual({
      hasSeparator: true,
      importOrder: [_BUILTIN_MODULES_RGX, _THIRD_PARTY_MODULES, '', '^[./]'],
      combineTypesAndImports: true,
      plugins: [],
      leadingSeparator: false,
    });
  });
  test('it should detect top-of-file gap', () => {
    expect(
      examineAndNormalizePluginOptions({
        importOrder: [''],
        importOrderParsers: [],
        importOrderTSVersion: '1.0.0',
        filepath: __filename,
      } as NormalizableOptions),
    ).toEqual({
      hasSeparator: true,
      importOrder: ['', _BUILTIN_MODULES_RGX, _THIRD_PARTY_MODULES],
      combineTypesAndImports: true,
      plugins: [],
      leadingSeparator: true,
    });
  });
  test('it should detect typescript-version-dependent-flags', () => {
    expect(
      examineAndNormalizePluginOptions({
        importOrder: [],
        importOrderParsers: ['typescript'],
        importOrderTSVersion: '5.0.0',
        filepath: __filename,
      } as NormalizableOptions),
    ).toEqual({
      hasSeparator: false,
      importOrder: [_BUILTIN_MODULES_RGX, _THIRD_PARTY_MODULES],
      combineTypesAndImports: true,
      plugins: ['typescript'],
      leadingSeparator: false,
    });
  });
  test('it should call getExperimentalParserPlugins & filter', () => {
    // full tests for getExperimentalParserPlugins is in its own spec file
    expect(
      examineAndNormalizePluginOptions({
        importOrder: [],
        importOrderParsers: ['typescript', 'jsx'],
        importOrderTSVersion: '5.0.0',
        filepath: __filename,
      } as NormalizableOptions),
    ).toEqual({
      hasSeparator: false,
      importOrder: [_BUILTIN_MODULES_RGX, _THIRD_PARTY_MODULES],
      combineTypesAndImports: true,
      plugins: ['typescript'],
      leadingSeparator: false,
    });
  });
  test('it should not have a problem with a missing filepath', () => {
    expect(
      examineAndNormalizePluginOptions({
        importOrder: [],
        importOrderParsers: [],
        importOrderTSVersion: '1.0.0',
        filepath: undefined,
      } as NormalizableOptions),
    ).toEqual({
      hasSeparator: false,
      importOrder: [_BUILTIN_MODULES_RGX, _THIRD_PARTY_MODULES],
      combineTypesAndImports: true,
      plugins: [],
      leadingSeparator: false,
    });
  });
});
