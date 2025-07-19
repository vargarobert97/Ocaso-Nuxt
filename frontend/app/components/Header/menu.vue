<template>
  <ul class="menu">
    <li v-for="(item, index) in menuItems" :key="item.label" class="menu__item" ref="menuItemsRef">
      <button
        v-if="hasSubItems(item)"
        type="button"
        class="menu__link menu__link--parent"
        :class="{ 'menu__link--open': openDropdown === index }"
        @click="toggleDropdown(index)"
        tabindex="0"
        @keydown.enter.prevent="toggleDropdown(index)"
      >
        {{ item.label }}
        <!-- Font Awesome caret-down SVG -->
        <svg
          :class="['caret-icon', { 'caret-icon--open': openDropdown === index }]"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 320 512"
        >
          <path
            d="M31.5 192h257c28.4 0 42.8 34.5 22.6 54.6l-128.5 128c-12.5 12.5-32.8 12.5-45.3 0l-128.5-128C-11.3 226.5 3.1 192 31.5 192z"
          />
        </svg>
      </button>
      <NuxtLink
        v-else-if="item.url || item.page?.slug"
        :to="getLocalizedUrl(item)"
        :target="item.target"
        :title="t('menu.navigateTo', { label: item.label })"
        class="menu__link"
      >
        {{ item.label }}
      </NuxtLink>
      <span v-else class="menu__link menu__link--disabled">
        {{ item.label }}
      </span>

      <!-- Sub-menu -->
      <transition name="fade">
        <ul v-if="item.subItems && item.subItems.length > 0 && openDropdown === index" class="menu__submenu">
          <li v-for="subItem in item.subItems" :key="subItem.label" class="menu__submenu-item">
            <NuxtLink
              v-if="subItem.url || subItem.page?.slug"
              :to="getLocalizedUrl(subItem)"
              :target="subItem.target"
              :title="t('menu.navigateTo', { label: subItem.label })"
              class="menu__submenu-link"
              @click="closeDropdown"
            >
              {{ subItem.label }}
            </NuxtLink>
            <span v-else class="menu__submenu-link menu__submenu-link--disabled">
              {{ subItem.label }}
            </span>
          </li>
        </ul>
      </transition>
    </li>
  </ul>
</template>

<script setup lang="ts">
  import type { MenuItem } from '~/types/strapi';
  import { ref, onMounted, onBeforeUnmount } from 'vue';

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
    return `/${locale.value}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const openDropdown = ref<number | null>(null);
  const menuItemsRef = ref([]);

  const toggleDropdown = (index: number) => {
    openDropdown.value = openDropdown.value === index ? null : index;
  };

  function closeDropdown() {
    openDropdown.value = null;
  }

  function handleClickOutside(event: MouseEvent) {
    if (!menuItemsRef.value.some((el: HTMLElement) => el && el.contains(event.target as Node))) {
      closeDropdown();
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<style lang="scss" scoped>
  .menu {
    @apply flex space-x-8;

    &__item {
      @apply relative;
    }

    &__link {
      @apply text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;

      &.router-link-active {
        @apply text-blue-600 bg-blue-50;
      }

      &--parent {
        @apply cursor-pointer hover:text-gray-900;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        @apply px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200;
        height: 100%;
      }

      &--open {
        @apply text-gray-900;
      }

      &--disabled {
        @apply text-gray-400 cursor-not-allowed;
      }
    }

    &__submenu {
      @apply absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-2 min-w-48 z-10;
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
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .caret-icon {
    transition: transform 0.2s ease;
  }

  .caret-icon--open {
    transform: rotate(180deg);
  }
</style>
