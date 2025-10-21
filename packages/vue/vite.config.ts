import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

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
        return id === 'vue' || id.startsWith('@btc-connect/core');
      },
    },
    // 使用 terser 进行真正的代码压缩和混淆
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
        // 基本的压缩选项，不使用 unsafe 选项
        dead_code: true,
        unused: true,
        hoist_funs: true,
        hoist_vars: true,
        join_vars: true,
        collapse_vars: true,
        reduce_vars: true,
        sequences: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        if_return: true,
        inline: true,
        switches: true,
      },
      mangle: true, // 启用变量名混淆
      format: {
        comments: false, // 移除注释
      },
    },
    target: 'es2019',
    // 移除 sourcemap 以减少包大小
    sourcemap: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
