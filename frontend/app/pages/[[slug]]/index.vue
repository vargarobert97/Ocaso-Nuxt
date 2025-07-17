<template>
  <div>
    <SharedContentSection
      v-for="(section, index) in pageData?.data.content"
      :key="index"
      :content="section"
      :index="index"
      :is-first="index === 0"
      :is-last="index === (pageData?.data.content?.length || 0) - 1"
    />
  </div>
</template>

<script setup lang="ts">
  import type { SiteOption, StrapiResponse } from '~/types/strapi';
  import type { GraphQLPage } from '~/types/graphql';

  interface StrapiGraphQLResponse<T> {
    data: {
      [key: string]: T[];
    };
  }

  const route = useRoute();
  const router = useRouter();
  const { locale } = useI18n();

  // Get site options from the layout (injected)
  const siteOptions = inject<Ref<StrapiResponse<SiteOption> | null>>('siteOptions');
  const graphql = useStrapiGraphQL();
  const { pageFields } = usePageGraphQLFields();

  const pageQueryKey = computed(() => {
    return `pageData-${locale.value}-${route.params.slug || 'homepage'}`;
  });

  const { data: pageData } = await useAsyncData(
    pageQueryKey.value,
    async () => {
      // Use extracted page fields from composable

      let query: string;
      let variables: Record<string, unknown>;

      if (router.currentRoute.value.params.slug) {
        query = `
          query GetPageBySlug($locale: I18NLocaleCode!, $slug: String!) {
            pages(filters: { slug: { eq: $slug } }, locale: $locale) {
              ${pageFields}
            }
          }
        `;
        variables = {
          locale: locale.value,
          slug: router.currentRoute.value.params.slug,
        };
      } else {
        query = `
          query GetPageById($locale: I18NLocaleCode!, $documentId: ID!) {
            pages(filters: { documentId: { eq: $documentId } }, locale: $locale) {
              ${pageFields}
            }
          }
        `;
        variables = {
          locale: locale.value,
          documentId: siteOptions?.value?.data?.homepage?.documentId,
        };
      }

      try {
        const response = await graphql<StrapiGraphQLResponse<GraphQLPage>>(query, variables);
        const pages = response.data?.pages;
        return pages?.[0] ? { data: pages[0] } : null;
      } catch (error) {
        console.error('GraphQL query failed:', error);
        throw createError({
          statusCode: 500,
          statusMessage: 'GraphQL query failed',
          fatal: true,
        });
      }
    },
    {}
  );

  // Check for 404 and throw error if needed
  if (router.currentRoute.value.params.slug && !pageData.value?.data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page not found',
      fatal: true,
    });
  }
</script>
