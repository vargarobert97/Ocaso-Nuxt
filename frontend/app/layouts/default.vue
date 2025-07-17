<template>
  <div>
    <Html :lang="localeHead.htmlAttrs.lang" :dir="localeHead.htmlAttrs?.dir">
      <Body>
        <!-- Header -->
        <Header v-if="siteOptions?.data" :site-options="siteOptions.data" />

        <!-- Main Content -->
        <main class="flex flex-1 justify-center">
          <slot />
        </main>

        <!-- Footer -->
        <Footer v-if="siteOptions?.data" :site-options="siteOptions.data" />
      </Body>
    </Html>
  </div>
</template>

<script setup lang="ts">
  // Fetch site options with unstorage caching
  const { data: siteOptions } = await useSiteOptions();

  // Provide site options to child components
  provide('siteOptions', siteOptions);

  const route = useRoute();
  const localeHead = useLocaleHead({ lang: true });
  
  // Default SEO from site options
  const defaultSeo = computed(() => siteOptions.value?.data?.seo);
  
  // Page-specific SEO (from route meta)
  const pageSeo = computed(() => ({
    metaTitle: route.meta.title as string,
    metaDescription: route.meta.metaDescription as string,
    structuredData: route.meta.structuredData,
  }));
  
  // Combine page SEO with default SEO
  const combinedSeo = computed(() => {
    if (!defaultSeo.value) return pageSeo.value;
    
    return {
      ...defaultSeo.value,
      ...pageSeo.value,
      // Only override if page has specific values
      metaTitle: pageSeo.value?.metaTitle || defaultSeo.value.metaTitle,
      metaDescription: pageSeo.value?.metaDescription || defaultSeo.value.metaDescription,
      // Use page structured data if available, otherwise use default
      structuredData: pageSeo.value?.structuredData || defaultSeo.value.structuredData,
    };
  });

  // Use the Strapi SEO composable for consistent SEO handling
  const { setSeo } = useStrapiSeo();
  
  // Set SEO when data changes
  watchEffect(() => {
    if (combinedSeo.value) {
      setSeo(combinedSeo.value);
    }
  });

  // Set favicon and other head elements
  const favicon = computed(() => siteOptions.value?.data?.favicon);
  
  // Combine locale head with our custom head elements
  const combinedHead = computed(() => {
    const baseHead = {
      htmlAttrs: localeHead.value.htmlAttrs,
      link: [
        ...localeHead.value.link, // This includes hreflang alternates and canonical
      ],
    };
    

    
    return baseHead;
  });
  
  useHead(combinedHead);
  
  // Handle favicon separately to avoid context issues
  watchEffect(() => {
    if (favicon.value?.url) {
      const faviconUrl = useStrapiMediaSafe(favicon.value.url);
      useHead({
        link: [
          { rel: 'icon', href: faviconUrl }
        ]
      });
    }
  });
</script>
