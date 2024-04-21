import { runTest } from '../run-test';

runTest(__dirname, ['typescript'], {
  importOrder: [
    '', // Empty string here signifies blank line after top-of-file-comments
    '<BUILTIN_MODULES>',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    '^[./]',
  ],
});
