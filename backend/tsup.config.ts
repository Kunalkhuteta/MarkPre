import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],   // your main entry
  outDir: 'dist',
  format: ['esm'],          // generate ESM output
  clean: true,
  dts: true,                // optional type declarations
  splitting: false,         // keep files separate
  sourcemap: true,
  esbuildOptions(options) {
    // this ensures TS imports without extensions are converted to .js in JS output
    options.resolveExtensions = ['.ts', '.js', '.json'];
  }
});
