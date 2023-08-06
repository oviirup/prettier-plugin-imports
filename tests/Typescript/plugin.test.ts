import { runTest } from '../run-test'

runTest(__dirname, ['typescript'], {
	importOrder: ['^@core/(.*)$', '^@server/(.*)', '^@ui/(.*)$', '^[./]'],
	importOrderParsers: [
		'typescript',
		'jsx',
		'decorators-legacy',
		'classProperties',
	],
})
