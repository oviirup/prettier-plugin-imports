import { runTest } from '../run-test'

runTest(__dirname, ['babel-ts'], {
	importOrder: [
		'<THIRD_PARTY_MODULES>',
		'^@core/(.*)$',
		'^@server/(.*)',
		'^@ui/(.*)$',
		'^[./]',
	],
})
