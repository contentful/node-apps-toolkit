import { defineConfig } from 'tsup'

const allJsConfig = {
  entry: ['src/index.ts','src/keys/index.ts','src/requests/index.ts','src/requests/typings/index.ts','src/utils/index.ts'],
  outDir: 'lib',
  target: 'node18',
  dts: true,
  external: ['jose'],
  preserveModules: true,
  sourcemap: true,
  outExtension: ({ format }) => (format === 'esm' ? { js: '.mjs' } : { js: '.cjs' }),
    
}
export default defineConfig([
  {
    ...allJsConfig,
    format: ['esm'],
    clean: true,
    splitting: true,
    shims: true,
  },
  {
    ...allJsConfig,
    format: ['cjs'],
    clean: false,
    splitting: false,
  }
])
