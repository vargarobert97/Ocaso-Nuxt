import type { SiteOption, StrapiResponse } from '~/types/strapi';

export const useSiteOptions = () => {
  const { locale } = useI18n();

  const { data, refresh, pending } = useAsyncData(
    'global-site-options',
    async (): Promise<StrapiResponse<SiteOption>> => {
      // Fetch from Nuxt server-side API (which will hit Strapi)
      const response = await $fetch<StrapiResponse<SiteOption>>('/api/site-options', {
        query: {
          locale: locale.value,
        },
      });

      return response;
    },
    {
      // Don't watch locale changes - handle them manually
      watch: [],
    }
  );

  // Manual watcher that respects cache
  watch(locale, async () => {
    // Always refetch when locale changes
    await refresh();
  });

  return { data, refresh, pending };
};
