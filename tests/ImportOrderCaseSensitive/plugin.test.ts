import { runTest } from '../run-test';

runTest(__dirname, ['typescript'], {
  importOrder: ['^@core/(.*)$', '^@server/(.*)', '^@ui/(.*)$', '^[./]'],
  importOrderCaseSensitive: true,
  importOrderParserPlugins: ['typescript'],
});
