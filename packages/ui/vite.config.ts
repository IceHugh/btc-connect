import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'connect-button': resolve(__dirname, 'src/connect-button.ts'),
        'wallet-modal': resolve(__dirname, 'src/wallet-modal.ts'),
      },
      name: 'BtcConnectUI',
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^lit/],
    },
    target: 'es2019',
  },
  plugins: [
    dts() as any,
  ],
  optimizeDeps: {
    include: ['lit']
  }
});
