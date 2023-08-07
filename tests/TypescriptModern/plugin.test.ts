import { runTest } from '../run-test'

runTest(__dirname, ['typescript'], {
	importOrder: ['^@core/(.*)$', '^@server/(.*)', '^@ui/(.*)$', '^[./]'],
	importOrderParsers: ['typescript', 'decorators-legacy', 'classProperties'],
	importOrderTSVersion: '4.5.0',
})
