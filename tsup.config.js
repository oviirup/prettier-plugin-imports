const { defineConfig } = require('tsup')
const fs = require('node:fs')

// copy type definition
fs.copyFileSync('./source/plugin.d.ts', './plugin.d.ts')

// start build
module.exports = defineConfig(({ watch }) => ({
	entry: { plugin: './source/index.ts' },
	minify: !watch,
	outDir: '.',
}))
