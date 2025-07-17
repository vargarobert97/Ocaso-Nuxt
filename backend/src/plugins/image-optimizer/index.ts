import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';

export default ({ strapi }: { strapi: any }) => {
  // Use Strapi v5 lifecycle API for automatic WebP generation
  strapi.db.lifecycles.subscribe({
    models: ['plugin::upload.file'],
          async afterCreate(event) {
        const result = event.result;
        
        // Only process image files
        if (!result.mime.startsWith('image/')) {
          return;
        }
        if (result.ext === '.webp') {
          return;
        }
        
        // Wait for breakpoints to be generated and files to be fully uploaded
        setTimeout(async () => {
          try {
            // Re-fetch the file to get updated formats
            const updatedFile = await strapi.entityService.findOne('plugin::upload.file', result.id);
            
            if (!updatedFile.formats || Object.keys(updatedFile.formats).length === 0) {
              return;
            }
            
            const provider = strapi.plugin('upload').provider;
            const formatsToProcess = ['original', ...Object.keys(updatedFile.formats || {})];
            
            // Collect all WebP formats to update the database
            const webpFormats: any = {};
            
            for (const formatName of formatsToProcess) {
              const format = formatName === 'original' ? updatedFile : updatedFile.formats[formatName];
              if (!format) {
                continue;
              }
              
              // Skip if this format is already WebP
              if (format.ext === '.webp') {
                continue;
              }
              
              const webpFormat = await generateWebPVersion(format, provider, strapi);
              if (webpFormat) {
                // Create separate format object for WebP
                const webpFormatName = formatName === 'original' ? 'webp' : `${formatName}_webp`;
                webpFormats[webpFormatName] = webpFormat;
              }
            }
            
            // Update the database with WebP formats
            if (Object.keys(webpFormats).length > 0) {
              await strapi.entityService.update('plugin::upload.file', result.id, {
                data: {
                  formats: {
                    ...updatedFile.formats,
                    ...webpFormats
                  }
                }
              });
            }
          } catch (error) {
            strapi.log.error('Error generating WebP versions:', error);
          }
        }, 3000); // Wait 3 seconds for breakpoints to be generated, then use polling for availability
    },
    
    async beforeDelete(event) {
      // In Strapi v5, we need to fetch the entity before deletion
      const { id } = event.params.where;
      
      try {
        const file = await strapi.entityService.findOne('plugin::upload.file', id);
        
        if (!file || !file.formats) {
          return;
        }
        
        const provider = strapi.plugin('upload').provider;
        // Check if we're using a cloud provider by checking if any file has a cloud URL
        const isCloudProvider = file.url && file.url.startsWith('http') && !file.url.includes('localhost');
        
        if (isCloudProvider) {
          // For cloud providers, delete WebP files using the provider
          for (const [formatName, format] of Object.entries(file.formats)) {
            if (formatName.includes('webp') || (format as any).ext === '.webp') {
              try {
                await provider.delete(format as any);
              } catch (error) {
                // Silently ignore if file doesn't exist
              }
            }
          }
        } else {
          // For local provider, use the original logic
          const uploadDir = path.join(strapi.dirs.static.public, 'uploads');
          
          // Delete WebP files for all formats
          for (const [formatName, format] of Object.entries(file.formats)) {
            if (formatName.includes('webp') || (format as any).ext === '.webp') {
              const webpPath = path.join(uploadDir, (format as any).name);
              try {
                await fs.unlink(webpPath);
              } catch (error) {
                // Silently ignore if file doesn't exist
              }
            }
          }
        }
      } catch (error) {
        strapi.log.error('Error cleaning up WebP files:', error);
      }
    }
  });
};

async function generateWebPVersion(format: any, provider: any, strapi: any) {
  try {
    // Check if we're using a cloud provider by checking the file URL
    const isCloudProvider = format.url && format.url.startsWith('http') && !format.url.includes('localhost');
    
    if (isCloudProvider) {
      // For cloud providers, download the file, process it, and upload the WebP version
      return await generateWebPForCloudProvider(format, provider, strapi);
    } else {
      // For local provider, use the original logic
      return await generateWebPForLocalProvider(format, strapi);
    }
  } catch (error) {
    strapi.log.error(`Error generating WebP for ${format.name}:`, error);
    return null;
  }
}

async function generateWebPForCloudProvider(format: any, provider: any, strapi: any) {
  try {
    // Poll for file availability with 500ms intervals, up to 10 attempts (5 seconds total)
    let headResponse;
    let response;
    let attempts = 0;
    const maxAttempts = 30;
    const pollInterval = 500;
    
    while (attempts < maxAttempts) {
      // Test if the file exists first
      headResponse = await fetch(format.url, { method: 'HEAD' });
      if (headResponse.ok) {
        // File exists, try to download it
        response = await fetch(format.url);
        if (response.ok) {
          break; // Successfully downloaded
        }
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    if (!headResponse.ok || !response.ok) {
      strapi.log.error(`File not available at ${format.url} after ${maxAttempts} attempts (${maxAttempts * pollInterval}ms total), status: ${headResponse?.status || response?.status}`);
      return null;
    }
    
    const imageBuffer = await response.arrayBuffer();
    const webpBuffer = await sharp(Buffer.from(imageBuffer)).webp({ quality: 89 }).toBuffer();
    
    // Generate WebP filename
    const webpFilename = format.name.replace(/\.[^/.]+$/, '.webp');
    
    // Create a temporary file object for the WebP version
    const webpFile = {
      name: webpFilename,
      buffer: webpBuffer,
      mime: 'image/webp',
      size: webpBuffer.length
    };
    
    // Upload the WebP version using the same provider
    const uploadResult = await provider.upload(webpFile);
    
    // Return the WebP format object
    const webpFormat = {
      name: webpFilename,
      hash: format.hash,
      ext: '.webp',
      mime: 'image/webp',
      width: format.width,
      height: format.height,
      size: webpBuffer.length,
      sizeInBytes: webpBuffer.length,
      url: uploadResult.url,
      provider_metadata: uploadResult.provider_metadata
    };
    
    return webpFormat;
  } catch (error) {
    strapi.log.error(`Error generating WebP for cloud provider: ${error}`);
    return null;
  }
}

async function generateWebPForLocalProvider(format: any, strapi: any) {
  try {
    // Get the correct file path - use the uploads directory
    const uploadDir = path.join(strapi.dirs.static.public, 'uploads');
    
    // Try different ways to get the filename
    let fileName = format.name;
    if (format.hash && format.ext) {
      // If we have hash and ext, construct the filename
      fileName = `${format.hash}${format.ext}`;
    } else if (format.url) {
      // Extract filename from URL
      fileName = format.url.split('/').pop();
    }
    
    const filePath = path.join(uploadDir, fileName);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return null;
    }
    
    const imageBuffer = await fs.readFile(filePath);
    const webpBuffer = await sharp(imageBuffer).webp({ quality: 89 }).toBuffer();
    
    // Generate WebP filename with same pattern
    const webpFilename = fileName.replace(/\.[^/.]+$/, '.webp');
    const webpPath = path.join(uploadDir, webpFilename);
    
    await fs.writeFile(webpPath, webpBuffer);
    
    // Return the WebP format object
    const webpFormat = {
      name: webpFilename,
      hash: format.hash,
      ext: '.webp',
      mime: 'image/webp',
      path: webpPath,
      width: format.width,
      height: format.height,
      size: webpBuffer.length,
      sizeInBytes: webpBuffer.length,
      url: `/uploads/${webpFilename}`
    };
    
    return webpFormat;
  } catch (error) {
    strapi.log.error(`Error generating WebP for local provider: ${error}`);
    return null;
  }
} 