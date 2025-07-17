<template>
  <div class="text-box">
    <div v-if="title" class="title" v-html="title"/>
    <div v-if="content" class="content" v-html="content"/>
    <div v-if="ctas && ctas.length > 0" class="ctas">
      <a 
        v-for="(cta, index) in ctas" 
        :key="index"
        :href="cta.target"
        :class="['cta', `cta--${cta.type}`]"
      >
        <SharedStrapiImage 
          v-if="cta.icon" 
          :media="cta.icon" 
          :alt="cta.icon.alternativeText || ''" 
          class="cta__icon" 
        />
        {{ cta.text }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { WithTypename } from '~/types/graphql';
  import type { TextBox } from '~/types/strapi';

  type TextBoxComponent = WithTypename<TextBox>;

  const { component } = defineProps<{
    component: TextBoxComponent;
  }>();

  const title = component.title;
  const content = component.content;
  const ctas = component.ctas;
</script> 