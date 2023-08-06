import { runTest } from '../run-test'

runTest(__dirname, ['vue'], {
	importOrder: [
		'<THIRD_PARTY_MODULES>',
		'',
		'^@core/(.*)$',
		'',
		'^@server/(.*)',
		'',
		'^@ui/(.*)$',
		'',
		'^[./]',
	],
})
