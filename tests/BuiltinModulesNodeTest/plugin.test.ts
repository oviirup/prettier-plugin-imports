import { runTest } from '../run-test';

runTest(__dirname, ['typescript'], {
  importOrder: [
    '',
    '<BUILTIN_MODULES>',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    '^[.]',
  ],
});
