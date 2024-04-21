import { runTest } from '../run-test';

runTest(__dirname, ['typescript'], {
  importOrder: ['<THIRD_PARTY_MODULES>', '^[./]'],
});
