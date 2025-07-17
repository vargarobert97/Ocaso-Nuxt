<template>
  <div class="simple-text">
    <div v-html="text"/>
  </div>
</template>

<script setup lang="ts">
  import type { WithTypename } from '~/types/graphql';
  import type { SimpleText } from '~/types/strapi';

  type SimpleTextComponent = WithTypename<SimpleText>;

  const { component } = defineProps<{
    component: SimpleTextComponent;
  }>();

  const text = component.text;
</script> 