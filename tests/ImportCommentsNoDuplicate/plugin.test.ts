import { runTest } from '../run-test';

runTest(__dirname, ['typescript'], {
  importOrderParserPlugins: ['typescript'],
});
