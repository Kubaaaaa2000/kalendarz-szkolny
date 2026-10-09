// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ui: {
    theme: {
      colors:["primary","secondary"],
      defaultVariants: {
        color: 'primary',
        size: 'md'
      }
    }
  },
  pages: true,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'], 
  // ssr: false,
  css: ['~/assets/css/main.css'],
  // nitro: {
  //   // Blokada generowania problematycznego manifestu deweloperskiego
  //   appManifest: false
  // }
  // tailwindcss: {
  //   exposeConfig: true,
  //   viewer: true
  // }
})
