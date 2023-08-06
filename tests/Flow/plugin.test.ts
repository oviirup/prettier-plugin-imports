import { runTest } from '../run-test'

runTest(__dirname, ['flow'], {
	importOrder: ['^@core/(.*)$', '^@server/(.*)', '^@ui/(.*)$', '^[./]'],
	importOrderParsers: ['flow'],
})
