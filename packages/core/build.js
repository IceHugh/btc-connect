import dts from 'bun-plugin-dts';

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  target: 'browser',
  minify: true,
  plugins: [dts()],
});
