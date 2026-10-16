// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
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
  nitro: {
    prerender: {
      routes: [],
      crawlLinks: false
    }
  },
  // pages: true,
  compatibilityDate: '2025-07-15',
  devtools: { 
    enabled: true,
    vscode: {},
    timeline: { enabled: true }
  },
  modules: ['@nuxt/ui','@nuxtjs/supabase'], 
  css: ['~/assets/css/main.css'],
  supabase: {
    url:"https://opprhstcmnevrxdgzphs.supabase.co/",
    key:"sb_publishable_P2sewOWZk8Y1J9DGpipLhA_4odLNtcO",
    redirect: false
  },
   ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error','tertiary']
    }
  },
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