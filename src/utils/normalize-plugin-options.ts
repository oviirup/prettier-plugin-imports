import semver from 'semver';
import {
  _BUILTIN_MODULES,
  _BUILTIN_MODULES_RGX,
  _THIRD_PARTY_MODULES,
  _TYPES_MODULES,
} from '../constants';
import { ExtendedOptions, NormalizableOptions } from '../types';
import { getExperimentalParserPlugins } from './get-experimental-parser-plugins';

function normalizeImportOrder(order: NormalizableOptions['importOrder']) {
  // Clone the array so we can splice it
  order = order === null ? [] : [...order];
  // If we have a separator in the first slot, we need to inject our required words after it.
  const hasLeadingSeparator = order.length > 0 && isSeparator(order[0]);
  const spliceIndex = hasLeadingSeparator ? 1 : 0;
  // _THIRD_PARTY_MODULES is magic because "everything not matched by other groups goes here"
  // So it must always be present.
  if (!order.includes(_THIRD_PARTY_MODULES)) {
    order.splice(spliceIndex, 0, _THIRD_PARTY_MODULES);
  }
  // Opinionated Decision: NodeJS Builtin modules should always be separate from third party modules
  // Users may want to add their own separators around them or insert other modules above them though
  if (
    !order.includes(_BUILTIN_MODULES) &&
    !order.includes(_BUILTIN_MODULES_RGX)
  ) {
    order.splice(spliceIndex, 0, _BUILTIN_MODULES);
  }
  // use regex for builtin modules
  order = order.map((g) => (g === _BUILTIN_MODULES ? _BUILTIN_MODULES_RGX : g));
  return order;
}

/**
 * IsSeparator checks if the provided pattern is intended to be used as an
 * import separator,
 */
export function isSeparator(pattern?: string) {
  return pattern?.trim() === '';
}

/**
 * Verifies that our special words that must always be there are present on
 * importOrder Verifies that parser plugins are inferred correctly for certain
 * file extensions.
 *
 * Configures certain behavior flags such as
 *
 * - When to use certain typescript syntax
 * - When to inject blank lines after top-of-file comments
 * - When to inject blank lines around groups / side-effect nodes.
 */
export function examineAndNormalizePluginOptions(
  options: NormalizableOptions,
): ExtendedOptions {
  const { importOrderParsers, filepath } = options;
  let { importOrderTSVersion } = options;

  const isTSSemverValid = semver.valid(importOrderTSVersion);
  if (!isTSSemverValid) {
    console.warn(
      `[prettier-plugin-imports]: The option importOrderTSVersion is not a valid semver version and will be ignored.`,
    );
    importOrderTSVersion = '1.0.0';
  }

  const order = normalizeImportOrder(options.importOrder);

  // Do not combine type and value imports if `<TYPES>` is specified explicitly
  let combineTypesAndImports = !order.some((e) => e.includes(_TYPES_MODULES));

  let plugins = getExperimentalParserPlugins(importOrderParsers);
  // Do not inject jsx plugin for non-jsx ts files
  if (filepath?.endsWith('.ts')) {
    plugins = plugins.filter((p) => p !== 'jsx');
  }

  // Disable combineTypesAndImports if typescript is not set to a version that supports it
  if (
    plugins.includes('typescript') &&
    semver.lt(importOrderTSVersion, '4.5.0')
  ) {
    combineTypesAndImports = false;
  }
  return {
    importOrder: order,
    combineTypesAndImports,
    hasSeparator: order.some(isSeparator),
    // configured a separator before all imports
    leadingSeparator: isSeparator(order[0]),
    plugins,
  };
}

export const testingOnly = { normalizeImportOrder };
