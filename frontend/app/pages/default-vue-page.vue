<template>
  <div class="container">
    <h1 class="text-4xl font-bold mb-8">Strapi + Nuxt Monorepo</h1>
    <p>{{ t('welcome') }}</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">Frontend (Nuxt 3)</h2>
        <p class="text-gray-600 mb-4">Built with the latest Nuxt 3, TypeScript, and Tailwind CSS.</p>
        <ul class="space-y-2 text-sm">
          <li>✅ TypeScript support</li>
          <li>✅ Tailwind CSS</li>
          <li>✅ VueUse composables</li>
          <li>✅ Strapi integration</li>
        </ul>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">Backend (Strapi 5)</h2>
        <p class="text-gray-600 mb-4">Headless CMS with SQLite for development.</p>
        <ul class="space-y-2 text-sm">
          <li>✅ TypeScript support</li>
          <li>✅ SQLite database</li>
          <li>✅ Auto-generated types</li>
          <li>✅ REST API</li>
        </ul>
      </div>
    </div>

    <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4">Type Generation</h2>
      <p class="text-gray-600 mb-4">
        When you create content types in Strapi, run this command to generate TypeScript types:
      </p>
      <pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto"><code>npm run generate-types</code></pre>

      <p class="text-gray-600 mt-4">
        This will create types in <code class="bg-gray-100 px-2 py-1 rounded">frontend/types/strapi.ts</code> that you
        can import and use in your components.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  const { t } = useI18n();
</script>

<style lang="scss" scoped></style>
