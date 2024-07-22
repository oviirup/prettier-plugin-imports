import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    cache: false,
    resolveSnapshotPath: (path, ext) => path + ext,
    setupFiles: ['./tests/raw-serializer'],
  },
});
