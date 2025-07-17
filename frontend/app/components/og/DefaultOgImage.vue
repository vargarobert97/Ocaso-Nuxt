<template>
  <div class="og-image">
    <div class="og-image__content">
      <h1 class="og-image__title">{{ title }}</h1>
      <p class="og-image__description">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<style scoped>
.og-image {
  width: 1200px;
  height: 630px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.og-image__content {
  text-align: center;
  padding: 2rem;
}

.og-image__title {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.og-image__description {
  font-size: 1.5rem;
  opacity: 0.9;
  max-width: 800px;
}
</style> 