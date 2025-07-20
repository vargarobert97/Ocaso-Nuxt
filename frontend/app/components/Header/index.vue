<template>
  <header class="header" :class="{ 'header--hidden': !isHeaderVisible }">
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

        <!-- Desktop Navigation -->
        <nav class="header__nav">
          <HeaderMenu :menu-items="siteOptions?.headerMenu?.menuItems || []" />
        </nav>

        <!-- Mobile Menu Button -->
        <button
          type="button"
          class="header__mobile-btn"
          @click="toggleMobileMenu"
          :aria-label="t('mobileMenu.toggle')"
          :aria-expanded="isMobileMenuOpen"
        >
          <!-- Hamburger Icon -->
          <!-- Discuss with Laszlo -->
          <!-- v-if="!isMobileMenuOpen" -->
          <svg
            v-if="!isMobileMenuOpen"
            class="header__mobile-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <HeaderMobileMenu
      :is-open="isMobileMenuOpen"
      :menu-items="siteOptions?.headerMenu?.menuItems || []"
      @close="closeMobileMenu"
    />
  </header>
  <div class="header-spacer"></div>
</template>

<script setup lang="ts">
  import type { SiteOption } from '~/types/strapi';
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';

  const props = defineProps<{ siteOptions: SiteOption }>();

  const isHeaderVisible = ref(true);
  const isMobileMenuOpen = ref(false);
  const lastScrollY = ref(0);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY < 0) return;
    if (currentScrollY > lastScrollY.value) {
      // Scrolling down (even a little)
      isHeaderVisible.value = false;
    } else if (currentScrollY < lastScrollY.value) {
      // Scrolling up
      isHeaderVisible.value = true;
    }
    lastScrollY.value = currentScrollY;
  };

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
  });

  const { t, locale, locales } = useI18n();
  const setLocale = (code: string) => {
    locale.value = code as typeof locale.value;
  };
  const currentLocale = locale;
  const availableLocales = locales;

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
  };

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
  };

  const route = useRoute();
  watch(
    () => route.path,
    () => {
      closeMobileMenu();
    }
  );

  watch(
    () => locale.value,
    () => {
      closeMobileMenu();
    }
  );
</script>

<style lang="scss" scoped>
  .header {
    @apply fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200 transition-transform ease-in-out duration-300;
    &--hidden {
      transform: translateY(-100%);
    }
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

    &__mobile-btn {
      @apply md:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200;
    }

    &__mobile-icon {
      @apply w-6 h-6;
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
  .header-spacer {
    height: var(--header-height, 4rem);
  }
</style>
