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
      // 排除所有第三方依赖，只打包项目代码
      external: [
        'vue',
        '@btc-connect/core',
        // 常见第三方依赖包
        /^node:.*/,
        // Vue 生态系统
        '@vue/runtime-core',
        '@vue/reactivity',
        '@vue/shared',
        // 其他可能的依赖
        /^@vue\/.*/,
      ],
    },
    // 暂时禁用混淆，使用基础压缩
    minify: 'esbuild',
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
