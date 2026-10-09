// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app: {
    baseURL: '/kalendarz-szkolny/',
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
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/']
    }
  },

  // nitro: {
  //   appManifest: false
  // }
})
