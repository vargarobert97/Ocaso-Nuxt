import { cacheBustService } from '../../../../services/cache-bust-service';

export default {
  async afterUpdate(event) {
    const { result } = event;
    
    // Get the locale of the updated site-option
    const locale = result.locale;
    
    // Trigger cache busting for the specific language
    await cacheBustService.bustSiteOptionsCache(locale);
    
    // Also bust all languages if this is a global change
    // You can add logic here to determine if it's a global change
    // For example, if certain fields are updated that affect all languages
    const globalFields = ['siteLogo', 'favicon']; // Add fields that affect all languages
    const changedFields = Object.keys(event.params.data || {});
    
    const hasGlobalChanges = globalFields.some(field => changedFields.includes(field));
    
    if (hasGlobalChanges) {
      // Bust all languages for global changes
      await cacheBustService.bustSiteOptionsCache();
    }
  },

  async afterCreate(event) {
    const { result } = event;
    const locale = result.locale;
    
    // Bust cache for the new site-option
    await cacheBustService.bustSiteOptionsCache(locale);
  },

  async afterDelete(event) {
    // When a site-option is deleted, bust all site-options caches
    // as the deletion might affect the default fallback
    await cacheBustService.bustSiteOptionsCache();
  },
}; 