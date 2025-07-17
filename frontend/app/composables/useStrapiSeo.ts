import type { Seo } from '~/types/strapi'

export const useStrapiSeo = (seoData?: Seo) => {
  const setSeo = (data?: Seo) => {
    if (!data) return
    
    const seoConfig = {
      title: data.metaTitle,
      description: data.metaDescription,
      keywords: data.keywords,
      robots: data.metaRobots,
      ogImage: data.metaImage?.url,
      ogImageAlt: data.metaImage?.alternativeText,
    }
    
    // Set SEO using nuxt-seo
    useSeoMeta({
      title: seoConfig.title,
      description: seoConfig.description,
      keywords: seoConfig.keywords,
      robots: seoConfig.robots,
      ogImage: seoConfig.ogImage,
      ogImageAlt: seoConfig.ogImageAlt,
    })
    
    // Set viewport meta if available
    if (data.metaViewport) {
      useHead({
        meta: [
          { name: 'viewport', content: data.metaViewport }
        ]
      })
    }
    
    // Set OpenGraph data if available
    if (data.openGraph) {
      useSeoMeta({
        ogTitle: data.openGraph.ogTitle,
        ogDescription: data.openGraph.ogDescription,
        ogImage: data.openGraph.ogImage?.url,
        ogUrl: data.openGraph.ogUrl,
        // Additional OpenGraph fields
        ogImageWidth: data.openGraph.ogImage?.width,
        ogImageHeight: data.openGraph.ogImage?.height,
        ogImageAlt: data.openGraph.ogImage?.alternativeText,
      })
    }
    
    // Set canonical URL if available
    if (data.canonicalURL) {
      useHead({
        link: [
          { rel: 'canonical', href: data.canonicalURL }
        ]
      })
    }
    
    // Set structured data if available
    if (data.structuredData) {
      const structuredDataArray = Array.isArray(data.structuredData) 
        ? data.structuredData 
        : [data.structuredData];
      
      structuredDataArray.forEach((item) => {
        if (item) {
          useHead({
            script: [
              {
                type: 'application/ld+json',
                innerHTML: typeof item === 'string' 
                  ? item 
                  : JSON.stringify(item)
              }
            ]
          })
        }
      });
    }
  }
  
  // Set SEO immediately if data is provided
  if (seoData) {
    setSeo(seoData)
  }
  
  return {
    setSeo,
  }
} 