<template>
  <div class="footer-menu">
    <div v-for="menu in menuItems" :key="menu.id" class="footer-menu__block">
      <div v-for="menuItem in menu.menuItems" :key="menuItem.label" class="footer-menu__section">
        <h3 class="footer-menu__title">{{ menuItem.label }}</h3>
        <ul class="footer-menu__list">
          <li v-for="subItem in menuItem.subItems" :key="subItem.label" class="footer-menu__item">
            <NuxtLink
              v-if="subItem.url"
              :to="getLocalizedUrl(subItem.url)"
              :target="subItem.target"
              class="footer-menu__link"
              :title="t('menu.navigateTo', { label: subItem.label })"
              :class="{ 'footer-menu__link--active': isActiveLink(getLocalizedUrl(subItem.url)) }"
            >
              {{ subItem.label }}
            </NuxtLink>
            <span v-else class="footer-menu__link footer-menu__link--disabled">
              {{ subItem.label }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Menu } from '~/types/strapi';

  defineProps<{
    menuItems: Menu[];
  }>();

  const route = useRoute();
  const {t, locale } = useI18n();

  const isActiveLink = (url: string) => {
    if (!url) return false;
    return route.path === url;
  };

  const getLocalizedUrl = (url: string) => {
    if (!url) return '';
    // If it's already a full URL, return as is
    if (url.startsWith('http')) return url;
    // If it's the default locale, return without prefix
    const config = useRuntimeConfig();
    const defaultLocale = config.public.i18n?.defaultLocale || 'en';
    if (locale.value === defaultLocale) return url;
    // For other locales, add the locale prefix
    return `/${locale.value}${url}`;
  };

</script>

<style lang="scss" scoped>
  .footer-menu {
    @apply flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8;

    &__section {
      @apply flex flex-col;
    }

    &__title {
      @apply text-sm font-semibold text-gray-900 mb-3;
    }

    &__list {
      @apply flex flex-col space-y-2;
    }

    &__item {
      @apply relative;
    }

    &__link {
      @apply text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200;

      &--active {
        @apply text-blue-600;
      }

      &--disabled {
        @apply text-gray-400 cursor-not-allowed;
      }
    }
  }
</style> 