import { runTest } from '../run-test';

runTest(__dirname, ['babel'], {
  importOrder: [
    '<THIRD_PARTY_MODULES>',
    '^@core/(.*)$',
    '^@server/(.*)',
    '^@ui/(.*)$',
    '^[./]',
  ],
  importOrderParserPlugins: [
    '[\"importAttributes\", {\"deprecatedAssertSyntax\": true}]',
  ],
});
