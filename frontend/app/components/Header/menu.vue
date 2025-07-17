<template>
  <ul class="menu">
    <li v-for="item in menuItems" :key="item.label" class="menu__item">
      <NuxtLink
        v-if="item.url || item.page?.slug"
        :to="getLocalizedUrl(item)"
        :target="item.target"
        :title="t('menu.navigateTo', { label: item.label })"
        class="menu__link"
      >
        {{ item.label }}
      </NuxtLink>
      <span
        v-else
        class="menu__link"
        :class="{
          'menu__link--parent': hasSubItems(item),
          'menu__link--disabled': !hasSubItems(item),
        }"
      >
        {{ item.label }}
      </span>

      <!-- Sub-menu -->
      <ul v-if="item.subItems && item.subItems.length > 0" class="menu__submenu">
        <li v-for="subItem in item.subItems" :key="subItem.label" class="menu__submenu-item">
          <NuxtLink
            v-if="subItem.url || subItem.page?.slug"
            :to="getLocalizedUrl(subItem)"
            :target="subItem.target"
            :title="t('menu.navigateTo', { label: subItem.label })"
            class="menu__submenu-link"
          >
            {{ subItem.label }}
          </NuxtLink>
          <span v-else class="menu__submenu-link menu__submenu-link--disabled">
            {{ subItem.label }}
          </span>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
  import type { MenuItem } from '~/types/strapi';

  defineProps<{
    menuItems: MenuItem[];
  }>();

  const { t, locale } = useI18n();

  const hasSubItems = (item: MenuItem) => {
    return item.subItems && item.subItems.length > 0;
  };

  const getLocalizedUrl = (item: MenuItem) => {
    const url = item.url || item.page?.slug;
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
  .menu {
    @apply flex space-x-8;

    &__item {
      @apply relative;
    }

    &__link {
      @apply text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200;

      &.router-link-active {
        @apply text-blue-600 bg-blue-50;
      }

      &--parent {
        @apply cursor-pointer hover:text-gray-900;
      }

      &--disabled {
        @apply text-gray-400 cursor-not-allowed;
      }
    }

    &__submenu {
      @apply absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-2 min-w-48 z-10 hidden;

      .menu__item:hover & {
        @apply block;
      }
    }

    &__submenu-item {
      @apply block;
    }

    &__submenu-link {
      @apply block px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200;

      &.router-link-active {
        @apply text-blue-600 bg-blue-50;
      }

      &--disabled {
        @apply text-gray-400 cursor-not-allowed hover:bg-transparent;
      }
    }
  }
</style>
