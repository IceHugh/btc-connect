await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  target: 'browser',
  minify: {
    whitespace: true,
    syntax: true,
    identifiers: true,
  },
  // 添加更多压缩选项
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  // 移除 source map 减少包大小
  sourcemap: false,
});
