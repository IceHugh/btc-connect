import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      outDir: 'dist',
      entryRoot: 'src',
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json'),
      copyDtsFiles: true,
      rollupTypes: true,
      // 保守设置，避免生产中断
      logLevel: 'info',
    }) as any,
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BtcConnectVue',
      fileName: (format) => `index.${format}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^vue/, /^@btc-connect\//],
    },
    target: 'es2019',
  },
})
