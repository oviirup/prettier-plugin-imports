import { runTest } from '../run-test'

runTest(__dirname, ['typescript'], {
	importOrder: [
		// '<BUILTIN_MODULES>',     // This is injected by options normalization
		'<THIRD_PARTY_MODULES>',
		'',
		'^@core/(.*)$',
		'^@server/(.*)',
		'^@ui/(.*)$',
		'',
		'^[./]',
	],
})
