
/**
 * PR opened at https://github.com/nuxt-modules/strapi/pull/484 composable will be irrelevant after it's merged
 * Safely handles Strapi media URLs for both development and production environments.
 * 
 * In development, Strapi typically returns relative paths (e.g., '/uploads/image.jpg')
 * In production (Strapi Cloud), Strapi returns full URLs (e.g., 'https://domain.media.strapiapp.com/image.jpg')
 * 
 * This composable automatically detects the URL type and handles it appropriately:
 * - Full URLs are returned as-is
 * - Relative paths are processed through useStrapiMedia to construct full URLs
 * 
 * @param url - The media URL from Strapi (can be relative or absolute)
 * @returns The complete, accessible media URL
 * 
 * @example
 * // Development: '/uploads/favicon.svg' → 'http://localhost:1337/uploads/favicon.svg'
 * // Production: 'https://domain.media.strapiapp.com/favicon.svg' → 'https://domain.media.strapiapp.com/favicon.svg'
 */
export const useStrapiMediaSafe = (url: string | undefined | null): string => {
  if (!url) return '';
  
  try {
    // Try to construct a URL - if it succeeds, it's already a valid URL
    new URL(url);
    return url;
  } catch {
    // If URL construction fails, it's a relative path - use useStrapiMedia
    return useStrapiMedia(url);
  }
}; 