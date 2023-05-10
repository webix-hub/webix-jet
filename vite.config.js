import { defineConfig } from 'vite';
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({
    outputDir: "dist/types",
    insertTypesEntry: true,
  })],
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  build: {
    outDir: 'dist',
    assetsDir: '',
    lib: {
        entry: 'sources/index.ts',
        name: 'webixJet',
        fileName: 'jet'
    }
  },
  test: {
    browser: {
        include: ['tests/**/*.spec.{ts,js}'],
        enabled: true,
        headless: true,
        name: 'chrome',
    },
  }
});
