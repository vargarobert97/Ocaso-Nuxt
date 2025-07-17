<template>
  <component :is="componentType" :component="component" />
</template>

<script setup lang="ts">
  import type { PageComponent } from '~/types/graphql';

  const { component } = defineProps<{
    component: PageComponent;
  }>();

  // INFO: while creating a mapping instead of this looks better
  // the compiler cannot resolve the component names, leave this as is!
  const componentType = computed(() => {
    switch (component.__typename) {
      case 'ComponentPageComponentsHero':
        return resolveComponent('LazyPageComponentsHero');
      case 'ComponentPageComponentsSimpleText':
        return resolveComponent('LazyPageComponentsSimpleText');
      case 'ComponentPageComponentsTextBox':
        return resolveComponent('PageComponentsTextBox');
      case 'ComponentPageComponentsImage':
        return resolveComponent('PageComponentsImage');
      case 'ComponentPageComponentsHeroSlider':
        return resolveComponent('LazyPageComponentsHeroSlider');
      default:
        console.warn(`Unknown component type: ${component.__typename}`);
        return null;
    }
  });
</script>
