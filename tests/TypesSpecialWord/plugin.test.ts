import { runTest } from '../run-test';

runTest(__dirname, ['typescript'], {
  importOrder: ['<TYPES>', '<THIRD_PARTY_MODULES>', '^[./]', '<TYPES>^[./]'],
  importOrderParserPlugins: ['typescript'],
});
