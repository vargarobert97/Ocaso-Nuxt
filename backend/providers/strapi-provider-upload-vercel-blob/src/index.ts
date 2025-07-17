import { put, del } from "@vercel/blob";

interface ProviderOptions {
  token: string;
}

interface File {
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: any;
  hash: string;
  ext?: string;
  mime: string;
  size: number;
  url?: string;
  previewUrl?: string;
  provider?: string;
  provider_metadata?: any;
  stream?: any;
  buffer?: Buffer;
}

module.exports = {
  init(providerOptions: ProviderOptions) {
    if (!providerOptions.token) {
      throw new Error("Vercel Blob token is required");
    }

    const upload = async (file: File) => {
      try {
        // Use buffer if available, otherwise use stream
        const blob = await put(file.name, file.buffer || file.stream, {
          access: "public",
          token: providerOptions.token,
          allowOverwrite: true
        });

        // Modify the file object directly (like the S3 provider does)
        file.url = blob.url;
        file.provider_metadata = {
          url: blob.url,
          pathname: blob.pathname,
          contentType: blob.contentType,
          contentDisposition: blob.contentDisposition,
          size: file.size
        };

        // Add a small delay to allow Vercel Blob to become available
        await new Promise(resolve => setTimeout(resolve, 300));

        // Return the modified file object
        return file;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Upload error:", errorMessage);
        throw new Error(`Upload to Vercel Blob failed: ${errorMessage}`);
      }
    };

    return {
      async upload(file: File) {
        return await upload(file);
      },

      async uploadStream(file: File) {
        return await upload(file);
      },

      async delete(file: File) {
        try {
          // Extract the pathname from the URL or provider_metadata
          let pathname = file.provider_metadata?.pathname;

          if (!pathname && file.url) {
            // Extract pathname from URL if not in metadata
            const url = new URL(file.url);
            pathname = url.pathname.replace("/blob/", "");
          }

          if (!pathname) {
            // Return a resolved promise instead of undefined
            return Promise.resolve();
          }

          await del(pathname, { token: providerOptions.token });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          // Check if the error is about the file not existing
          if (
            errorMessage.includes("not found") ||
            errorMessage.includes("does not exist") ||
            errorMessage.includes("404") ||
            errorMessage.includes("NoSuchKey")
          ) {
            // Return a resolved promise instead of undefined
            return Promise.resolve();
          }
          throw new Error(`Delete from Vercel Blob failed: ${errorMessage}`);
        }
      },

      checkFileSize(file: File, { sizeLimit }: { sizeLimit: number }) {
        if (file.size > sizeLimit) {
          throw new Error(`File size ${file.size} exceeds limit ${sizeLimit}`);
        }
      },

      getSignedUrl(file: File) {
        // Vercel Blob URLs are already public, so we can return the URL as is
        // If you need signed URLs for private access, you would implement that here
        return { url: file.url };
      },

      isPrivate() {
        // Return false since we're using public access
        // Change to true if you want private access with signed URLs
        return false;
      }
    };
  }
};
