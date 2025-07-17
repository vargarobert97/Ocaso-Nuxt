import qs from 'qs';
import type { SiteOption, StrapiResponse } from '~/types/strapi';
import type { H3Event } from 'h3';
import { getStorageItem, setStorageItem } from '~/utils/storage';

async function getSiteOptions(event: H3Event): Promise<StrapiResponse<SiteOption>> {
  const query = getQuery(event);
  const locale = query.locale || 'en';
  const cacheKey = `server-site-options-${locale}`;

  // Check cache
  const cached = await getStorageItem<StrapiResponse<SiteOption>>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from Strapi if not cached
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl || 'http://localhost:1337';

  try {
    const populate = {
      siteLogo: true,
      favicon: true,
      seo: true,
      headerMenu: {
        populate: {
          menuItems: {
            populate: {
              page: {
                fields: ['slug'],
              },
              subItems: {
                populate: {
                  page: {
                    fields: ['slug'],
                  },
                },
              },
            },
          },
        },
      },
      homepage: true,
      footerMenus: {
        populate: {
          menuItems: {
            populate: {
              page: {
                fields: ['slug'],
              },
              subItems: {
                populate: {
                  page: {
                    fields: ['slug'],
                  },
                },
              },
            },
          },
        },
      },
    };

    const queryString = qs.stringify(
      {
        populate,
        locale,
      },
      { encodeValuesOnly: true }
    );

    const response = await $fetch<StrapiResponse<SiteOption>>(`${strapiUrl}/api/site-option?${queryString}`);

    // Cache the response
    await setStorageItem(cacheKey, response, { ttl: 3600 });

    return response;
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch site options',
    });
  }
}

export default process.env.VERCEL
  ? defineCachedEventHandler(getSiteOptions, { maxAge: 300 })
  : defineEventHandler(getSiteOptions);
