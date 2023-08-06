import { runTest } from '../run-test'

runTest(__dirname, ['typescript'], {
	importOrder: [
		'^@core/(.*)$',
		'^@server/(.*)',
		'^@ui/(.*)$',
		'^[./]',
		'', // This adds a newline before side effect groups
	],
})
