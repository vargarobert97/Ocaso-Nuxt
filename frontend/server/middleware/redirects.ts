import { $fetch } from 'ofetch';
import type { StrapiResponse, Redirect } from '~/types/strapi';
import { getStorageItem, setStorageItem } from '~/utils/storage';

// Function to fetch redirects from Strapi
async function fetchRedirectsFromStrapi(): Promise<Redirect[]> {
  const config = useRuntimeConfig();
  const strapiUrl = config.public?.strapiUrl || process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  try {
    const response = await $fetch<StrapiResponse<Redirect[]>>(`${strapiUrl}/api/redirects`);
    // Only keep active redirects
    const data = response?.data;
    return data?.filter((item: Redirect) => item.isActive === true) || [];
  } catch (error) {
    console.error('Failed to fetch redirects from Strapi:', error);
    return [];
  }
}

// Function to store redirects using unified storage
async function storeRedirects(redirects: Redirect[]): Promise<void> {
  await setStorageItem('redirects', redirects, { ttl: 3600 });
}

export default defineEventHandler(async event => {
  const url = getRequestURL(event);

  // Skip middleware for API routes and static assets
  if (url.pathname.startsWith('/_nuxt/') || url.pathname.startsWith('/api/')) {
    return;
  }

  let redirects: Redirect[] = [];
  let storageExists = false;

  try {
    // Get redirects from unified storage
    const cachedRedirects = await getStorageItem<Redirect[]>('redirects');
    if (cachedRedirects) {
      redirects = cachedRedirects;
      storageExists = true;
    }
  } catch {
    // Storage doesn't exist or can't be read
    storageExists = false;
  }

  // If storage doesn't exist, fetch from Strapi and store them
  if (!storageExists) {
    redirects = await fetchRedirectsFromStrapi();
    if (redirects.length > 0) {
      await storeRedirects(redirects);
    }
  }

  // Find matching redirect
  const redirect = redirects.find(r => {
    const matchesPath = r.from === url.pathname;
    const isActive = r.isActive === true;
    return matchesPath && isActive;
  });

  if (redirect) {
    // Set appropriate status code based on redirect type
    const statusCode = redirect.type === 'permanent' ? 301 : 302;

    // Perform the redirect
    return sendRedirect(event, redirect.to as string, statusCode);
  }
});
