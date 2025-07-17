<template>
  <nuxt-img
    v-if="media"
    :src="imageUrl"
    :srcset="imageSrcset"
    :alt="imageAlt"
    :class="imageClass"
    :format="format"
    :quality="quality"
    :loading="loading"
    :sizes="sizes"
    :width="width"
    :height="height"
  />
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

  const { getImageUrl, getImageSrcset } = useStrapiImage();

  const imageUrl = computed(() => getImageUrl(props.media, props.preferredFormat));
  const imageSrcset = computed(() => getImageSrcset(props.media, props.preferredFormat));
  const imageAlt = computed(() => props.alt || props.media?.alternativeText || '');
</script>
