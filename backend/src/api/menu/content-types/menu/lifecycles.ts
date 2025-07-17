import { cacheBustService } from '../../../../services/cache-bust-service';

export default {
  async afterUpdate(event) {
    const { result } = event;
    
    // Get the locale of the updated menu
    const locale = result.locale;
    
    // Bust site-options cache for the specific language since menus are part of site options
    await cacheBustService.bustMenuCache(locale);
    
    // Also bust all languages if this is a global change
    // You can add logic here to determine if it's a global change
    // For example, if certain fields are updated that affect all languages
    const globalFields = ['slug']; // Add fields that affect all languages
    const changedFields = Object.keys(event.params.data || {});
    
    const hasGlobalChanges = globalFields.some(field => changedFields.includes(field));
    
    if (hasGlobalChanges) {
      // Bust all languages for global changes
      await cacheBustService.bustMenuCache();
    }
  },

  async afterCreate(event) {
    const { result } = event;
    const locale = result.locale;
    
    // Bust cache for the new menu
    await cacheBustService.bustMenuCache(locale);
  },

  async afterDelete(event) {
    // When a menu is deleted, bust all site-options caches
    // as the deletion might affect the default fallback
    await cacheBustService.bustMenuCache();
  },
}; 