<template>
  <footer class="footer">
    <div class="footer__container">
      <div class="footer__content">
        <div class="footer__menus">
          <FooterMenu v-if="siteOptions?.footerMenus?.length" :menu-items="siteOptions.footerMenus" />
        </div>
      </div>
      <div class="footer__bottom">
        <p class="footer__copyright">© {{ new Date().getFullYear() }} All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import type { SiteOption } from '~/types/strapi';

  defineProps<{
    siteOptions: SiteOption;
  }>();
</script>

<style lang="scss" scoped>
  .footer {
    @apply bg-gray-50 border-t border-gray-200 mt-auto w-full;
  }

  .footer__container {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full;
  }

  .footer__content {
    @apply flex flex-col md:flex-row justify-start items-start py-10 gap-12;
  }

  .footer__menus {
    @apply w-full;
  }

  .footer__bottom {
    @apply border-t border-gray-200 mt-8 pt-6 pb-4 flex justify-center;
  }

  .footer__copyright {
    @apply text-center text-gray-500 text-sm;
  }
</style>
