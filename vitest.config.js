import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		cache: false,
		setupFiles: ['./tests/raw-serializer'],
	},
})
