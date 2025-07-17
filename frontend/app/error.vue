<template>
  <div class="error-page">
    <div class="error-page__container">
      <div class="error-page__content">
        <div class="error-page__icon">
          <svg
            v-if="error.statusCode === 404"
            class="error-page__svg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
            />
          </svg>
          <svg v-else class="error-page__svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h1 class="error-page__title">
          {{ error.statusCode === 404 ? 'Page Not Found' : 'Server Error' }}
        </h1>

        <p class="error-page__message">
          {{
            error.statusCode === 404
              ? 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'
              : 'Something went wrong on our end. Please try again later.'
          }}
        </p>

        <div class="error-page__actions">
          <button class="error-page__button error-page__button--primary" @click="handleError">Go Back</button>
          <NuxtLink to="/" class="error-page__button error-page__button--secondary"> Home </NuxtLink>
        </div>
        
        <!-- Development error trace -->
        <div v-if="isDev && error.stack" class="error-page__trace">
          <details class="error-page__details">
            <summary class="error-page__summary">Error Details (Development)</summary>
            <pre class="error-page__stack">{{ error.stack }}</pre>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode: number;
    statusMessage: string;
    stack?: string;
  };
}>();

const isDev = process.env.NODE_ENV === 'development';

const handleError = () => {
  clearError({ redirect: '/' });
};

// Meta tags for error pages
const title = computed(() => 
  props.error.statusCode === 404 ? 'Page Not Found - 404' : 'Server Error - 500'
);

const description = computed(() => 
  props.error.statusCode === 404 
    ? 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'
    : 'Something went wrong on our end. Please try again later.'
);

// Set page meta
useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:card', content: 'summary' }
  ]
});
</script>

<style lang="scss" scoped>
  .error-page {
    @apply min-h-screen flex items-center justify-center bg-gray-50;

    &__container {
      @apply max-w-md w-full mx-auto px-4;
    }

    &__content {
      @apply text-center bg-white rounded-lg shadow-lg p-8;
    }

    &__icon {
      @apply mb-6;
    }

    &__svg {
      @apply w-16 h-16 mx-auto text-gray-400;
    }

    &__title {
      @apply text-2xl font-bold text-gray-900 mb-4;
    }

    &__message {
      @apply text-gray-600 mb-8 leading-relaxed;
    }

    &__actions {
      @apply flex flex-col sm:flex-row gap-4 justify-center;
    }

    &__button {
      @apply px-6 py-3 rounded-lg font-medium transition-colors duration-200;

      &--primary {
        @apply bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
      }

          &--secondary {
      @apply bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2;
    }
  }
  
  &__trace {
    @apply mt-8 pt-6 border-t border-gray-200;
  }
  
  &__details {
    @apply text-left;
  }
  
  &__summary {
    @apply cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2;
  }
  
  &__stack {
    @apply text-xs text-gray-600 bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap;
  }
}
</style>
