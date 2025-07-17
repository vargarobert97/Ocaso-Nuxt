<template>
  <div class="hero">
    <SharedStrapiPicture 
      :media="picture" 
      :alt="picture?.alternativeText || ''"
      class="w-full h-auto"
    />
  </div>
</template>

<script setup lang="ts">
  import type { WithTypename } from '~/types/graphql';
  import type { Hero } from '~/types/strapi';

  type HeroComponent = WithTypename<Hero>;

  const { component } = defineProps<{
    component: HeroComponent;
  }>();

  const picture = component.picture;
</script> 