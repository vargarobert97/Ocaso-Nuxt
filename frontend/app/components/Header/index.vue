<template>
  <header class="header">
    <div class="header__container">
      <div class="header__content">
        <!-- Logo -->
        <div class="header__logo-section">
          <NuxtLink to="/" class="header__logo" aria-label="Home" :title="t('header.logo.title')">
            <SharedStrapiImage
              :media="siteOptions.siteLogo"
              image-class="header__logo-image"
              format="webp"
              :quality="80"
              :show-placeholder="false"
            />
          </NuxtLink>
          <div class="lang-switcher">
            <button
              v-for="l in availableLocales"
              :key="l.code"
              :class="['lang-switcher__btn', { 'lang-switcher__btn--active': l.code === currentLocale }]"
              :disabled="l.code === currentLocale"
              @click="setLocale(l.code)"
            >
              {{ l.code.toUpperCase() }}
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="header__nav">
          <HeaderMenu :menu-items="siteOptions?.headerMenu?.menuItems || []" />
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { HeaderMenu } from '#components';
  import type { SiteOption } from '~/types/strapi';
  const { t } = useI18n();

  defineProps<{
    siteOptions: SiteOption;
  }>();

  const { locale, locales, setLocale } = useI18n();
  const currentLocale = locale;
  const availableLocales = locales;
</script>

<style lang="scss" scoped>
  .header {
    @apply bg-white shadow-sm border-b border-gray-200;

    &__container {
      @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
    }

    &__content {
      @apply flex justify-between items-center h-16;
    }

    &__logo-section {
      @apply flex items-center;
    }

    &__logo {
      @apply flex items-center;
    }

    &__logo-image {
      @apply h-8 w-auto;
    }

    &__logo-text {
      @apply text-xl font-bold text-gray-900;
    }

    &__nav {
      @apply hidden md:flex space-x-8;
    }

    &__nav-link {
      @apply text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium;
    }
  }

  .lang-switcher {
    @apply flex gap-4;
    &__btn {
      @apply px-4 py-2 border border-gray-300 bg-gray-100 cursor-pointer rounded font-bold transition-colors duration-200;
      &--active,
      &:disabled {
        @apply bg-gray-800 text-white cursor-default;
      }
    }
  }
</style>
