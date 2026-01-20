// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [
    '@/assets/css/main.css'
  ],
  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
  ],
  supabase: {
    url: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
    key:
      process.env.SUPABASE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',

      // Wenn deine Version "include" unterstützt:
      include: ['/dashboard/**'],

      // public routes:
      exclude: ['/', '/login', '/register/**', '/confirm', '/preise', '/blog'],
      saveRedirectToCookie: false,
    },
  },
})
