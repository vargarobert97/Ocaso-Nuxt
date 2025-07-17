import { cacheBustService } from '../../../../services/cache-bust-service';

export default {
  afterCreate: async event => {
    const { result } = event;
    console.log('🔄 Redirect created, busting cache...', result.id);

    try {
      await cacheBustService.bustRedirectsCache();
      console.log('✅ Redirect cache busted after create');
    } catch (error) {
      console.error('❌ Failed to bust redirect cache after create:', error);
    }
  },

  afterUpdate: async event => {
    const { result } = event;
    console.log('🔄 Redirect updated, busting cache...', result.id);

    try {
      await cacheBustService.bustRedirectsCache();
      console.log('✅ Redirect cache busted after update');
    } catch (error) {
      console.error('❌ Failed to bust redirect cache after update:', error);
    }
  },

  afterDelete: async event => {
    const { result } = event;
    console.log('🔄 Redirect deleted, busting cache...', result.id);

    try {
      await cacheBustService.bustRedirectsCache();
      console.log('✅ Redirect cache busted after delete');
    } catch (error) {
      console.error('❌ Failed to bust redirect cache after delete:', error);
    }
  },
};
