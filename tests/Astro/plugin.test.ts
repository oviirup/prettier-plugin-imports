import * as plugin from '../../src';
import { runTest } from '../run-test';

runTest(__dirname, ['astro'], {
  plugins: ['prettier-plugin-astro', plugin],
  importOrder: [
    '<TYPES>',
    '<BUILT_IN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '^[./]',
  ],
});
