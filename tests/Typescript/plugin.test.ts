import { runTest } from '../run-test';

runTest(__dirname, ['typescript'], {
  importOrder: ['^@core/(.*)$', '^@server/(.*)', '^@ui/(.*)$', '^[./]'],
  importOrderParserPlugins: [
    'typescript',
    'jsx',
    'decorators-legacy',
    'classProperties',
    '[\"importAttributes\", {\"deprecatedAssertSyntax\": true}]',
  ],
});
