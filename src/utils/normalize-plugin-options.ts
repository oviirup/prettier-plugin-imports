import semver from 'semver';
import {
  BUILTIN_MODULES_REGEX_STR,
  BUILTIN_MODULES_SPECIAL_WORD,
  THIRD_PARTY_MODULES_SPECIAL_WORD,
  TYPES_SPECIAL_WORD,
} from '../constants';
import { ExtendedOptions, NormalizableOptions } from '../types';
import { getExperimentalParserPlugins } from './get-experimental-parser-plugins';

// If importOrder is not set in the config, it will be pre-populated with the default before it hits this
// function.  This means we should never get something like `undefined`, and if we see a config of `[]`,
// someone set that explicitly in their config.
function normalizeImportOrderOption(
  importOrder: NormalizableOptions['importOrder'],
) {
  // Allow disabling by setting an empty array, short-circuit
  if (Array.isArray(importOrder) && !importOrder.length) {
    return importOrder;
  }

  importOrder = [...importOrder]; // Clone the array so we can splice it

  // If we have a separator in the first slot, we need to inject our required words after it.
  const hasLeadingSeparator =
    importOrder.length > 0 && isCustomGroupSeparator(importOrder[0]);
  const spliceIndex = hasLeadingSeparator ? 1 : 0;

  // THIRD_PARTY_MODULES_SPECIAL_WORD is magic because "everything not matched by other groups goes here"
  // So it must always be present.
  if (!importOrder.includes(THIRD_PARTY_MODULES_SPECIAL_WORD)) {
    importOrder.splice(spliceIndex, 0, THIRD_PARTY_MODULES_SPECIAL_WORD);
  }

  // Opinionated Decision: NodeJS Builtin modules should always be separate from third party modules
  // Users may want to add their own separators around them or insert other modules above them though
  if (
    !(
      importOrder.includes(BUILTIN_MODULES_SPECIAL_WORD) ||
      importOrder.includes(BUILTIN_MODULES_REGEX_STR)
    )
  ) {
    importOrder.splice(spliceIndex, 0, BUILTIN_MODULES_SPECIAL_WORD);
  }

  importOrder = importOrder.map((g) =>
    g === BUILTIN_MODULES_SPECIAL_WORD ? BUILTIN_MODULES_REGEX_STR : g,
  );

  return importOrder;
}

/**
 * IsCustomGroupSeparator checks if the provided pattern is intended to be used
 * as an import separator, rather than an actual group of imports.
 */
export function isCustomGroupSeparator(pattern?: string) {
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
  const { importOrderParserPlugins, filepath } = options;
  let { importOrderTypeScriptVersion } = options;

  const isTSSemverValid = semver.valid(importOrderTypeScriptVersion);
  if (!isTSSemverValid) {
    console.warn(
      `[@ianvs/prettier-plugin-sort-imports]: The option importOrderTypeScriptVersion is not a valid semver version and will be ignored.`,
    );
    importOrderTypeScriptVersion = '1.0.0';
  }

  const importOrder = normalizeImportOrderOption(options.importOrder);

  // Do not combine type and value imports if `<TYPES>` is specified explicitly
  let importOrderCombineTypeAndValueImports = importOrder.some((group) =>
    group.includes(TYPES_SPECIAL_WORD),
  )
    ? false
    : true;

  let plugins = getExperimentalParserPlugins(importOrderParserPlugins);
  // Do not inject jsx plugin for non-jsx ts files
  if (filepath?.endsWith('.ts')) {
    plugins = plugins.filter((p) => p !== 'jsx');
  }

  // Disable importOrderCombineTypeAndValueImports if typescript is not set to a version that supports it
  if (
    plugins.includes('typescript') &&
    semver.lt(importOrderTypeScriptVersion, '4.5.0')
  ) {
    importOrderCombineTypeAndValueImports = false;
  }
  return {
    importOrder,
    importOrderCombineTypeAndValueImports,
    importOrderCaseSensitive: !!options.importOrderCaseSensitive,
    hasAnyCustomGroupSeparatorsInImportOrder: importOrder.some(
      isCustomGroupSeparator,
    ),
    // Now that the regex for <BUILTIN_MODULES> is present, we can check if the user
    // configured a separator before <BUILTIN_MODULES>
    provideGapAfterTopOfFileComments: isCustomGroupSeparator(importOrder[0]),
    plugins,
  };
}
export const testingOnly = { normalizeImportOrderOption };
