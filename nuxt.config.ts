// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  
  app: {
    head: {
      title: 'Kalendarz Szkolny' ,// Opcjonalnie: ustawiasz domyślny tytuł karty
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'shortcut icon', href: '/favicon.svg' }
      ]
      // link: [
      //   { rel: 'icon', type: 'image/svg+xml', href: '/app-icon-dark.svg' }
      // ]
    }
  },
  // pages: true,
  compatibilityDate: '2025-07-15',
  devtools: { 
    enabled: true,
    vscode: {},
    timeline: { enabled: true }
  },
  modules: ['@nuxt/ui'], 
  ssr: false,
  css: ['~/assets/css/main.css'],
  // nitro: {
  //   // Blokada generowania problematycznego manifestu deweloperskiego
  //   appManifest: false
  // }
  // tailwindcss: {
  //   exposeConfig: true,
  //   viewer: true
  // }
  experimental: {
    appManifest: false
  },

  // nitro: {
  //   appManifest: false
  // }
})
