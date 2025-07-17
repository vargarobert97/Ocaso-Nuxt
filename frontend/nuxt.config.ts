// https://nuxt.com/docs/api/configuration/nuxt-config

import type { ContentSecurityPolicyValue, CrossOriginEmbedderPolicyValue, PermissionsPolicyValue } from 'nuxt-security';

const STRAPI_URL = process.env.NUXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const SITE_BASE_URL = process.env.SITE_BASE_URL ?? 'http://localhost:3000';

// tracking settings
const GTM_URL = process.env.GTM_SOURCE ?? 'https://www.googletagmanager.com/';
const GTM_ID = process.env.GTM_ID;

// Security setting
let crossOriginEmbedderPolicy: CrossOriginEmbedderPolicyValue = 'unsafe-none';

const contentSecurityPolicy: ContentSecurityPolicyValue = {
  'img-src': [
    "'self'",
    'data:',
    // "https://maps.gstatic.com", // Google Maps
    // "https://maps.googleapis.com", // Google Maps
    // `${GTM_URL}`, // Tracking
    // `https://\*.linkedin.com`, // Tracking
    // `https://\*.google.hu`, // Tracking
    // `https://\*.google.com`, // Tracking
    // `https://\*.google.at`, // Tracking
    // `https://\*.google.de`, // Tracking
    // `https://\*.doubleclick.net`, // Tracking
    // `https://\*.facebook.com`, // Tracking
    // `https://\*.bing.com`, // Tracking
    // `https://\*.cookiebot.com`, // Cookie consent manager
    STRAPI_URL,
    STRAPI_URL.replace('.strapiapp.com', '.media.strapiapp.com'), // INFO: Strapi cloud media storage
  ],
  'font-src': [
    "'self'",
    'data:',
    // 'https://fonts.gstatic.com', // Google Fonts
    // 'https://fonts.googleapis.com', // Google Fonts
    // 'https://ka-p.fontawesome.com/releases/', // Font Awesome
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    // 'https://fonts.googleapis.com', // Google Fonts
    // 'https://embed.typeform.com', // Typeform
  ],
  'script-src': [
    "'self'",
    // `${GTM_URL}`, // Tracking
    // "'wasm-unsafe-eval'", // WebAssembly - REQUIRED for google maps (js)
    // 'https://maps.googleapis.com', // Google Maps
    "'strict-dynamic'",
    "'nonce-{{nonce}}'",
    "'unsafe-inline'", // For older browser compatibility (browsers supporting nonce will ignore this)
    STRAPI_URL,
    // `https://\*.cookiebot.com`, // Cookie consent manager
    // `https://\*.doubleclick.net`, // DoubleClick
    // `https://\*.google.at`, // Google
    // `https://\*.google.de`, // Google
  ],
  'media-src': [
    "'self'",
    STRAPI_URL,
    // `https://\*.cookiebot.com`, // Cookie consent manager
    // `https://\*.doubleclick.net`, // DoubleClick
  ],
  'worker-src': ["'self'", 'blob:', STRAPI_URL],
  'connect-src': ["'self'", 'https:', 'data:', STRAPI_URL],
  'frame-src': [
    "'self'",
    // `${GTM_URL}`, // Tracking
    // `https://\*.cookiebot.com`, // Cookie consent manager
    // `https://\*.doubleclick.net`, // DoubleClick
    // `https://\*.google.hu`, // Google
    // `https://\*.google.at`, // Google
    // `https://\*.google.de`, // Google
  ],
  'frame-ancestors': ["'self'"],
};

const permissionsPolicy: PermissionsPolicyValue = {
  fullscreen: [
    'self',
    // '"https://www.youtube.com"', // YouTube
    // '"https://player.vimeo.com"', // Vimeo
  ],
  autoplay: [
    'self',
    // '"https://www.youtube.com"', // YouTube
    // '"https://player.vimeo.com"', // Vimeo
  ],
};

if (process.env.NODE_ENV === 'development') {
  crossOriginEmbedderPolicy = 'unsafe-none';

  contentSecurityPolicy['font-src'] = [...(contentSecurityPolicy['font-src'] || []), SITE_BASE_URL];
  contentSecurityPolicy['script-src'] = [...(contentSecurityPolicy['script-src'] || []), SITE_BASE_URL];
  contentSecurityPolicy['img-src'] = [...(contentSecurityPolicy['img-src'] || []), SITE_BASE_URL];
  contentSecurityPolicy['style-src'] = [...(contentSecurityPolicy['style-src'] || []), SITE_BASE_URL];
  contentSecurityPolicy['connect-src'] = [...(contentSecurityPolicy['connect-src'] || []), STRAPI_URL];
}

// END: security settings

// APP settings
const app = {
  rootAttrs: {
    class: 'antialiased min-h-screen nuxt-root',
  },
  head: {
    meta: [] as Record<string, string>[],
    noscript: [] as Record<string, string>[],
    script: [] as Record<string, string>[],
  },
};

if (process.env.GOOGLE_SITE_VERIFICATION) {
  app.head.meta = app.head.meta || [];

  app.head.meta.push({
    name: 'google-site-verification',
    content: process.env.GOOGLE_SITE_VERIFICATION,
  });
}

if (GTM_ID) {
  // INFO: tracing script for GTM (js enabled) should  be handled in the app.vue with nuxt/scripts
  // app.head.script = app.head.script || [];
  // app.head.script.push({
  //   src: `${GTM_URL}/js?id=${GTM_ID}`,
  //   async: true,
  // });

  app.head.noscript = app.head.noscript || [];
  app.head.noscript.push({
    innerHTML: `
    <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>
    `,
  });
}
// END: APP settings

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: process.env.NODE_ENV === 'development' },

  // app settings
  app,

  css: ['~/assets/css/index.scss'],

  modules: [
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/image',
    // '@nuxt/scripts', // have to wait https://github.com/nuxt/scripts/pull/476 for nuxt 4.0.0
    ...(process.env.NODE_ENV === 'development' ? ['@nuxt/test-utils'] : []),
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/strapi',
    'nuxt-security',
    '@nuxtjs/seo',
    '@vueuse/nuxt',
    // 'nuxt-cron', // not needed for now
    'nuxt-og-image',
    'nuxt-swiper',
  ],

  security: {
    headers: {
      contentSecurityPolicy,
      permissionsPolicy,
      crossOriginEmbedderPolicy,
      xFrameOptions: false,
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubdomains: true,
        preload: true,
      },
    },
    corsHandler: {
      origin: [SITE_BASE_URL],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
  },

  i18n: {
    lazy: true,
    langDir: '../locales',
    strategy: 'prefix_except_default',
    baseUrl: SITE_BASE_URL,
    locales: [
      { code: 'de', language: 'de-DE', iso: 'de-DE', name: 'Deutsch', file: 'de.json' },
      { code: 'en', language: 'en-US', iso: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'de',
    vueI18n: '../i18n.options.ts',
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  strapi: {
    version: 'v5',
    url: STRAPI_URL,
  },

  image: {
    providers: {
      strapi: {
        name: 'strapi',
        provider: 'strapi',
        options: {
          baseURL: STRAPI_URL,
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      strapiUrl: STRAPI_URL,
      GTM_URL,
      GTM_ID,
      siteURL: SITE_BASE_URL,
    },
    // Private runtime config (server-side only)
    cacheBustWebhookPassword: process.env.CACHE_BUST_WEBHOOK_PASSWORD,
  },

  site: {
    // Basic site configuration for SEO
    url: SITE_BASE_URL,
    name: 'Lorem Corp',
    description: 'Default site description',
    defaultLocale: 'de',
  },

  sitemap: {
    // Sitemap configuration
    exclude: [],
  },

  ogImage: {
    // Basic configuration for nuxt-og-image
    defaults: {
      componentDirs: ['~/components/og'],
    },
  },

  // cron: {
  //   runOnInit: !process.env.VERCEL,
  //   timeZone: 'Europe/Berlin',
  //   jobsDir: 'cron',
  // },
});
