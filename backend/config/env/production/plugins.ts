export default ({ env }) => {
  const blobToken = env('BLOB_READ_WRITE_TOKEN');

  // Only use custom provider if token is available
  const useCustomProvider = blobToken && blobToken.trim() !== '';
  const provider = useCustomProvider ? 'strapi-provider-upload-vercel-blob' : 'local';

  return {
    upload: {
      config: {
        breakpoints: {
          mobile: 480,
          tablet: 768,
          desktop: 1024,
          wide: 1280,
          xlarge: 1536,
        },
        // Use Vercel Blob storage if token is set, otherwise use local
        provider: provider,
        providerOptions: useCustomProvider
          ? {
              token: blobToken,
            }
          : {},
        // Add error handling for provider loading
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },

    // Disable the WebP converter plugin as it converts everything to WebP
    // We'll handle WebP conversion differently to keep originals
    'webp-converter': {
      enabled: false,
    },

    seo: {
      enabled: true,
    },

    redirector: {
      enabled: true,
      resolve: './src/plugins/redirector',
    },
  };
};
