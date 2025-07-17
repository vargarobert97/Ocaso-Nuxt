<template>
  <figure class="image-component">
    <SharedStrapiPicture 
      :media="image" 
      :alt="image?.alternativeText || ''"
      class="w-full h-auto"
    />
  </figure>
</template>

<script setup lang="ts">
  import type { WithTypename } from '~/types/graphql';
  import type { Image } from '~/types/strapi';

  type ImageComponent = WithTypename<Image>;

  const { component } = defineProps<{
    component: ImageComponent;
  }>();

  const image = component.image;
</script> 