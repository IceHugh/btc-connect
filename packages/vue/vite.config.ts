import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      outDir: 'dist',
      entryRoot: 'src',
      // 使用标准的 TypeScript 声明文件生成
      rollupTypes: false,
      // 确保生成单一的类型声明文件
      insertTypesEntry: true,
      logLevel: 'info',
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json'),
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BtcConnectVue',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      // 只将 vue 和 core 设为 external
      external: (id) => {
        return id === 'vue' || 
               id.startsWith('@btc-connect/core')
      },
    },
    target: 'es2019',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
