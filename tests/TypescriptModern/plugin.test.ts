import { runTest } from '../run-test';

runTest(__dirname, ['typescript'], {
  importOrder: ['^@core/(.*)$', '^@server/(.*)', '^@ui/(.*)$', '^[./]'],
  importOrderParserPlugins: [
    'typescript',
    'decorators-legacy',
    'classProperties',
  ],
  importOrderTypeScriptVersion: '4.5.0',
});
