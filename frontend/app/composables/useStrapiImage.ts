import type { StrapiMedia, StrapiMediaFormat } from '~/types/strapi';

export const useStrapiImage = () => {
  // Function to replace Vercel Blob URLs with custom domain
  const replaceBlobUrl = (url: string): string => {
    const blobDomain = 'qf5ejh1bibzs1hcf.public.blob.vercel-storage.com';
    const customDomain = useRuntimeConfig().public.siteURL || 'your-domain.com';

    if (url.includes(blobDomain)) {
      try {
        // Parse the original URL
        const originalUrl = new URL(url);
        
        // Parse the custom domain URL
        const domainUrl = new URL(customDomain);
        
        // Create new URL with the custom domain and /media path
        const newUrl = new URL('/media' + originalUrl.pathname, domainUrl.origin);
        
        return newUrl.toString();
      } catch (error) {
        // Fallback to original URL if URL parsing fails
        console.warn('Failed to parse URL:', error);
        return url;
      }
    }

    return url;
  };

  const getImageUrl = (media: StrapiMedia | null | undefined, format: string = 'original'): string => {
    if (!media) return '';

    // If format is 'webp', try to get the webp format
    if (format === 'webp' && media.formats?.webp) {
      return replaceBlobUrl(useStrapiMediaSafe(media.formats.webp.url));
    }

    // If format is 'original', return the original URL
    if (format === 'original') {
      return replaceBlobUrl(useStrapiMediaSafe(media.url));
    }

    // For other formats, try to get the specific format
    if (media.formats && format in media.formats) {
      const formatData = media.formats[format as keyof typeof media.formats];
      if (formatData) {
        return replaceBlobUrl(useStrapiMediaSafe(formatData.url));
      }
    }

    // Fallback to original
    return replaceBlobUrl(useStrapiMediaSafe(media.url));
  };

  const getImageSrcset = (media: StrapiMedia | null | undefined, preferredFormat: string = 'webp'): string => {
    if (!media || !media.formats) return '';

    const srcsetParts: string[] = [];

    // Get all formats and filter by preferred format
    const formats = Object.entries(media.formats);

    if (preferredFormat === 'webp') {
      // Filter for WebP formats
      const webpFormats = formats
        .filter(([formatName, format]) => format && (formatName.includes('webp') || format.ext === '.webp'))
        .map(([formatName, format]) => ({ formatName, ...format }))
        .sort((a, b) => a.width - b.width);

      // Add WebP formats
      webpFormats.forEach(format => {
        srcsetParts.push(`${replaceBlobUrl(useStrapiMediaSafe(format.url))} ${format.width}w`);
      });
    } else {
      // Filter for non-WebP formats
      const originalFormats = formats
        .filter(([formatName, format]) => format && !formatName.includes('webp') && format.ext !== '.webp')
        .map(([formatName, format]) => ({ formatName, ...format }))
        .sort((a, b) => a.width - b.width);

      // Add original formats
      originalFormats.forEach(format => {
        srcsetParts.push(`${replaceBlobUrl(useStrapiMediaSafe(format.url))} ${format.width}w`);
      });

      // Add original image as fallback
      srcsetParts.push(`${replaceBlobUrl(useStrapiMediaSafe(media.url))} ${media.width}w`);
    }

    return srcsetParts.join(', ');
  };

  const getImageFormats = (media: StrapiMedia | null | undefined): Record<string, StrapiMediaFormat> => {
    if (!media || !media.formats) {
      return {};
    }

    const availableFormats: Record<string, StrapiMediaFormat> = {};

    Object.entries(media.formats).forEach(([formatName, format]) => {
      if (format) {
        availableFormats[formatName] = format;
      }
    });

    return availableFormats;
  };

  const getPictureSources = (
    media: StrapiMedia | null | undefined
  ): Array<{
    srcset: string;
    media?: string;
    type?: string;
  }> => {
    if (!media || !media.formats) {
      return [];
    }

    const sources: Array<{
      srcset: string;
      media?: string;
      type?: string;
    }> = [];

    // Create WebP source if available
    const webpSrcset: string[] = [];
    Object.entries(media.formats).forEach(([formatName, format]) => {
      if (format && (formatName.includes('webp') || format.ext === '.webp')) {
        webpSrcset.push(`${replaceBlobUrl(useStrapiMediaSafe(format.url))} ${format.width}w`);
      }
    });

    if (webpSrcset.length > 0) {
      // Sort WebP formats by width
      webpSrcset.sort((a, b) => {
        const widthA = parseInt(a.match(/(\d+)w$/)?.[1] || '0');
        const widthB = parseInt(b.match(/(\d+)w$/)?.[1] || '0');
        return widthA - widthB;
      });

      sources.push({
        srcset: webpSrcset.join(', '),
        type: 'image/webp',
      });
    }

    // Create fallback source (original format)
    const fallbackSrcset = getImageSrcset(media, 'original');
    if (fallbackSrcset) {
      sources.push({
        srcset: fallbackSrcset,
        type: media.mime || 'image/jpeg', // Use the original image's MIME type
      });
    }

    return sources;
  };

  return {
    getImageUrl,
    getImageSrcset,
    getImageFormats,
    getPictureSources,
  };
};
