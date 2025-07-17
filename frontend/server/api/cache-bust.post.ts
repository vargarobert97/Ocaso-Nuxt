import { removeStorageItem, clearStorage } from '~/utils/storage';

// Types for cache invalidation payload
type CacheInvalidationPayload = {
  dataType?: 'site-options' | 'redirects' | 'menus' | 'all';
  language?: string;
  specificKeys?: string[];
};

// Get available locales from i18n config
function getAvailableLocales(): string[] {
  // This matches the locales defined in nuxt.config.ts
  return ['de', 'en'];
}

export default defineEventHandler(async (event) => {
  // Only allow POST requests
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
    });
  }

  // Get webhook password from environment
  const webhookPassword = process.env.CACHE_BUST_WEBHOOK_PASSWORD;
  if (!webhookPassword) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook password not configured',
    });
  }

  // Validate webhook password
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || authHeader !== `Bearer ${webhookPassword}`) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  try {
    // Parse request body
    const body = await readBody(event) as CacheInvalidationPayload;
    
    // Validate payload
    if (!body || (typeof body !== 'object')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid payload format',
      });
    }

    const { dataType, language, specificKeys } = body;
    const clearedKeys: string[] = [];

    // Clear specific keys if provided
    if (specificKeys && Array.isArray(specificKeys)) {
      for (const key of specificKeys) {
        await removeStorageItem(key);
        clearedKeys.push(key);
      }
    } else {
      // Clear based on data type and language
      if (dataType === 'all') {
        // Clear all caches
        await clearStorage();
        clearedKeys.push('all');
      } else if (dataType === 'site-options') {
        // Clear site-options caches (server-side only)
        if (language) {
          // Clear specific language
          await removeStorageItem(`server-site-options-${language}`);
          clearedKeys.push(`server-site-options-${language}`);
        } else {
          // Clear all languages from i18n config
          const languages = getAvailableLocales();
          for (const lang of languages) {
            await removeStorageItem(`server-site-options-${lang}`);
            clearedKeys.push(`server-site-options-${lang}`);
          }
        }
      } else if (dataType === 'redirects') {
        // Clear redirects cache
        await removeStorageItem('redirects');
        clearedKeys.push('redirects');
      } else if (dataType === 'menus') {
        // Clear menus cache (which is part of site-options)
        if (language) {
          await removeStorageItem(`server-site-options-${language}`);
          clearedKeys.push(`server-site-options-${language}`);
        } else {
          const languages = getAvailableLocales();
          for (const lang of languages) {
            await removeStorageItem(`server-site-options-${lang}`);
            clearedKeys.push(`server-site-options-${lang}`);
          }
        }
      }
    }

    return {
      success: true,
      message: 'Cache cleared successfully',
      clearedKeys,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Cache bust error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to clear cache',
    });
  }
}); 