// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: ['~/assets/css/tailwind.css'],
  app: {
    head: {
      title: 'PDF Tool - Comprehensive PDF Manipulation',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Advanced PDF manipulation tool for merging, splitting, and editing PDF files. Free online PDF editor with professional features.' },
        { name: 'keywords', content: 'PDF editor, merge PDF, split PDF, edit PDF, online PDF tool, free PDF editor' },
        { name: 'author', content: 'PDF Tool' },
        { property: 'og:title', content: 'PDF Tool - Comprehensive PDF Manipulation' },
        { property: 'og:description', content: 'Advanced PDF manipulation tool for merging, splitting, and editing PDF files. Free online PDF editor with professional features.' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'PDF Tool - Comprehensive PDF Manipulation' },
        { name: 'twitter:description', content: 'Advanced PDF manipulation tool for merging, splitting, and editing PDF files' }
      ],
      link: [
        { rel: 'canonical', href: 'https://pdftool.com' }
      ]
    }
  },
  nitro: {
    prerender: {
      routes: ['/about', '/help', '/contact', '/legal', '/terms', '/privacy']
    }
  }
})