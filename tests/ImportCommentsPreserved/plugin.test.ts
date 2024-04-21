import { runTest } from '../run-test';

runTest(__dirname, ['typescript'], {
  importOrder: ['^@core/(.*)$', '^@server/(.*)', '^@ui/(.*)$', '^[./]'],
  importOrderTypeScriptVersion: '5.0.0',
  importOrderParserPlugins: [
    'typescript',
    'decorators-legacy',
    'classProperties',
  ],
});
