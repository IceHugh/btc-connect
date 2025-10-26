// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  // 模块配置
  modules: ['@nuxtjs/tailwindcss'],

  // CSS配置
  css: ['~/assets/css/main.css'],

  // TypeScript配置
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // 构建配置
  build: {
    transpile: ['@btc-connect/vue'],
  },

  // SSR配置
  ssr: true,

  // 兼容性配置
  nitro: {
    experimental: {
      wasm: true,
    },
  },

  // 应用配置
  app: {
    head: {
      title: 'BTC Connect - Nuxt 3 Example',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Bitcoin wallet connection example using Nuxt 3 and @btc-connect/vue',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  // 运行时配置
  runtimeConfig: {
    // Private keys (only available on server-side)
    // apiSecret: process.env.API_SECRET,

    // Public keys (exposed to client-side)
    public: {
      // btcConnectConfig: process.env.BTC_CONNECT_CONFIG
    },
  },

  // 组件自动导入
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // 开发服务器配置
  devServer: {
    port: 3001,
  },
});
