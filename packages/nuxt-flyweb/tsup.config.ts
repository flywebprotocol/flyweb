import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  external: ['nuxt', 'flyweb', '@nuxt/kit', '@nuxt/schema'],
});
