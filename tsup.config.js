import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts','src/keys/index.ts','src/requests/index.ts','src/requests/typings/index.ts','src/utils/index.ts'],
  outDir: 'lib',
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  target: 'node18',
  shims: true,
  preserveModules: true,
  outExtension: ({ format }) => (format === 'esm' ? { js: '.mjs' } : { js: '.cjs' }),
})
