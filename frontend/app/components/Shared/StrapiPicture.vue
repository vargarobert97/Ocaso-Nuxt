<template>
  <picture v-if="media" :class="imageClass">
    <source v-if="webpSrcset" type="image/webp" :sizes="sizes" :srcset="webpSrcset" >
    <source v-if="fallbackSrcset" :type="media?.mime || 'image/jpeg'" :sizes="sizes" :srcset="fallbackSrcset" >
    <img
      :src="fallbackUrl"
      :alt="imageAlt"
      :loading="loading"
      :sizes="sizes"
      :width="media?.width || 800"
      :height="media?.height || 600"
    >
  </picture>
</template>

<script setup lang="ts">
  import type { StrapiMedia } from '~/types/strapi';

  interface Props {
    media: StrapiMedia | null | undefined;
    alt?: string;
    preferredFormat?: string;
    format?: 'webp' | 'avif' | 'jpeg' | 'jpg' | 'png' | 'gif';
    quality?: number;
    loading?: 'lazy' | 'eager';
    sizes?: string;
    width?: number | string;
    height?: number | string;
    imageClass?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    alt: '',
    preferredFormat: 'webp',
    format: 'webp',
    quality: 80,
    loading: 'lazy',
    imageClass: '',
    sizes: '100vw',
    width: '100%',
    height: 'auto',
  });

  const { getImageUrl, getPictureSources } = useStrapiImage();

  const imageAlt = computed(() => props.alt || props.media?.alternativeText || '');

  // Get picture sources
  const sources = computed(() => getPictureSources(props.media));

  // WebP source (first source with type="image/webp")
  const webpSource = computed(() => sources.value.find(s => s.type === 'image/webp'));
  const webpSrcset = computed(() => webpSource.value?.srcset || '');

  // Fallback source (second source with original format type)
  const fallbackSource = computed(() => sources.value.find(s => s.type && s.type !== 'image/webp'));
  const fallbackSrcset = computed(() => fallbackSource.value?.srcset || '');

  // Fallback URL (original image)
  const fallbackUrl = computed(() => getImageUrl(props.media, 'original'));
</script>
