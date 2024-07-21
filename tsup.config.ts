import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'tsup';

// start build
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  onSuccess: async () => {
    // copy type definition
    let source = path.resolve(__dirname, 'src/plugin.d.ts');
    let target = path.resolve(__dirname, 'dist/index.d.ts');
    fs.copyFileSync(source, target);
    console.log('\x1b[30mDTS plugin.d.ts');
    console.log('\x1b[30mDTS    Copied Type definitions');
  },
});
