import { runTest } from '../run-test'

runTest(__dirname, ['typescript'], {
	importOrder: ['^@core/(.*)$', '^@server/(.*)', '^@ui/(.*)$', '^[./]'],
	importOrderTSVersion: '5.0.0',
	importOrderParsers: ['typescript', 'decorators-legacy', 'classProperties'],
})
