import fs from 'node:fs'
import { defineConfig } from 'tsup'

// copy type definition
fs.copyFileSync('./source/plugin.d.ts', './plugin.d.ts')

// start build
export default defineConfig({
	entry: { plugin: './source/index.ts' },
	format: ['cjs', 'esm'],
	outDir: '.',
})
