<template>
  <div>
    <!-- Mobile Menu Overlay -->
    <transition name="overlay">
      <div v-if="isOpen" class="mobile-menu__overlay" @click="closeMenu" @keydown.esc="closeMenu" tabindex="0" />
    </transition>

    <!-- Mobile Menu Drawer -->
    <transition name="drawer">
      <div v-if="isOpen" class="mobile-menu__drawer">
        <div class="mobile-menu__header">
          <button type="button" class="mobile-menu__close-btn" @click="closeMenu" :aria-label="t('mobileMenu.close')">
            <!-- Close icon (X) -->
            <svg
              class="mobile-menu__close-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav class="mobile-menu__nav">
          <ul class="mobile-menu__list">
            <li v-for="(item, index) in menuItems" :key="item.label" class="mobile-menu__item">
              <button
                v-if="hasSubItems(item)"
                type="button"
                class="mobile-menu__link mobile-menu__link--parent"
                :class="{ 'mobile-menu__link--open': openDropdown === index }"
                @click="toggleDropdown(index)"
              >
                {{ item.label }}
                <!-- Caret icon -->
                <svg
                  :class="['mobile-menu__caret', { 'mobile-menu__caret--open': openDropdown === index }]"
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
                class="mobile-menu__link"
                @click="closeMenu"
              >
                {{ item.label }}
              </NuxtLink>
              <span v-else class="mobile-menu__link mobile-menu__link--disabled">
                {{ item.label }}
              </span>

              <!-- Sub-menu -->
              <transition name="mobile-submenu">
                <ul
                  v-if="item.subItems && item.subItems.length > 0 && openDropdown === index"
                  class="mobile-menu__submenu"
                >
                  <li v-for="subItem in item.subItems" :key="subItem.label" class="mobile-menu__submenu-item">
                    <NuxtLink
                      v-if="subItem.url || subItem.page?.slug"
                      :to="getLocalizedUrl(subItem)"
                      :target="subItem.target"
                      :title="t('menu.navigateTo', { label: subItem.label })"
                      class="mobile-menu__submenu-link"
                      @click="closeMenu"
                    >
                      {{ subItem.label }}
                    </NuxtLink>
                    <span v-else class="mobile-menu__submenu-link mobile-menu__submenu-link--disabled">
                      {{ subItem.label }}
                    </span>
                  </li>
                </ul>
              </transition>
            </li>
          </ul>
        </nav>

        <!-- Language Switcher in Mobile Menu -->
        <div class="mobile-menu__footer">
          <div class="mobile-menu__lang-switcher">
            <span class="mobile-menu__lang-label">{{ t('mobileMenu.language') }}</span>
            <div class="mobile-menu__lang-buttons">
              <button
                v-for="l in availableLocales"
                :key="l.code"
                :class="['mobile-menu__lang-btn', { 'mobile-menu__lang-btn--active': l.code === currentLocale }]"
                :disabled="l.code === currentLocale"
                @click="setLocale(l.code)"
              >
                {{ l.code.toUpperCase() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import type { MenuItem } from '~/types/strapi';
  import { ref, onMounted, onBeforeUnmount } from 'vue';

  interface Props {
    isOpen: boolean;
    menuItems: MenuItem[];
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    close: [];
  }>();

  const { t, locale, locales, setLocale } = useI18n();
  const currentLocale = locale;
  const availableLocales = locales;

  const openDropdown = ref<number | null>(null);

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

  const toggleDropdown = (index: number) => {
    openDropdown.value = openDropdown.value === index ? null : index;
  };

  const closeMenu = () => {
    openDropdown.value = null;
    emit('close');
  };

  // Handle escape key
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.isOpen) {
      closeMenu();
    }
  };

  // Lock body scroll when menu is open
  const lockBodyScroll = () => {
    document.body.style.overflow = 'hidden';
  };

  const unlockBodyScroll = () => {
    document.body.style.overflow = '';
  };

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown);
    unlockBodyScroll();
  });

  // Watch for menu open/close to lock/unlock body scroll
  watch(
    () => props.isOpen,
    isOpen => {
      if (isOpen) {
        lockBodyScroll();
      } else {
        unlockBodyScroll();
      }
    }
  );
</script>

<style lang="scss" scoped>
  .mobile-menu {
    &__overlay {
      @apply fixed inset-0 bg-black bg-opacity-50 z-40;
    }

    //Discuss with Laszlo
    &__drawer {
      // @apply fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 flex flex-col;
      @apply fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 max-w-[85vw] bg-white shadow-xl z-50 flex flex-col;
    }

    &__header {
      @apply flex justify-end p-4 border-b border-gray-200;
    }

    &__close-btn {
      @apply p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200;
    }

    &__close-icon {
      @apply w-6 h-6;
    }

    &__nav {
      @apply flex-1 overflow-y-auto;
    }

    &__list {
      @apply py-4;
    }

    &__item {
      @apply border-b border-gray-100 last:border-b-0;
    }

    &__link {
      @apply block w-full text-left px-6 py-4 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200;
      display: flex;
      align-items: center;
      justify-content: space-between;

      &.router-link-active {
        @apply text-blue-600 bg-blue-50;
      }

      &--parent {
        @apply cursor-pointer;
      }

      &--open {
        @apply text-gray-900 bg-gray-50;
      }

      &--disabled {
        @apply text-gray-400 cursor-not-allowed hover:bg-transparent;
      }
    }

    &__caret {
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    &__caret--open {
      transform: rotate(180deg);
    }

    &__submenu {
      @apply bg-gray-50;
    }

    &__submenu-item {
      @apply border-t border-gray-100;
    }

    &__submenu-link {
      @apply block px-8 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200;

      &.router-link-active {
        @apply text-blue-600 bg-blue-50;
      }

      &--disabled {
        @apply text-gray-400 cursor-not-allowed hover:bg-transparent;
      }
    }

    &__footer {
      @apply border-t border-gray-200 p-4;
    }

    &__lang-switcher {
      @apply space-y-3;
    }

    &__lang-label {
      @apply block text-sm font-medium text-gray-700;
    }

    &__lang-buttons {
      @apply flex gap-2;
    }

    &__lang-btn {
      @apply px-3 py-2 text-sm border border-gray-300 bg-gray-100 cursor-pointer rounded font-medium transition-colors duration-200;

      &--active,
      &:disabled {
        @apply bg-gray-800 text-white cursor-default;
      }
    }
  }

  // Overlay transitions
  .overlay-enter-active,
  .overlay-leave-active {
    transition: opacity 0.3s ease;
  }

  .overlay-enter-from,
  .overlay-leave-to {
    opacity: 0;
  }

  // Drawer transitions
  .drawer-enter-active,
  .drawer-leave-active {
    transition: transform 0.3s ease;
  }

  .drawer-enter-from,
  .drawer-leave-to {
    transform: translateX(100%);
  }

  // Submenu transitions
  .mobile-submenu-enter-active,
  .mobile-submenu-leave-active {
    transition: all 0.2s ease;
  }

  .mobile-submenu-enter-from,
  .mobile-submenu-leave-to {
    opacity: 0;
    max-height: 0;
  }

  .mobile-submenu-enter-to,
  .mobile-submenu-leave-from {
    opacity: 1;
    max-height: 200px;
  }
</style>
