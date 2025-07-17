// Using native fetch instead of ofetch

interface CacheInvalidationPayload {
  dataType?: 'site-options' | 'redirects' | 'menus' | 'all';
  language?: string;
  specificKeys?: string[];
}

interface WebhookResponse {
  success: boolean;
  message: string;
  clearedKeys: string[];
  timestamp: string;
}

export class CacheBustService {
  private frontendUrl: string;
  private webhookPassword: string;

  constructor() {
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    this.webhookPassword = process.env.CACHE_BUST_WEBHOOK_PASSWORD || '';
    
    if (!this.webhookPassword) {
      console.warn('CACHE_BUST_WEBHOOK_PASSWORD not set - cache busting will be disabled');
    }
  }

  /**
   * Trigger cache busting webhook
   */
  async triggerCacheBust(payload: CacheInvalidationPayload): Promise<WebhookResponse | null> {
    if (!this.webhookPassword) {
      console.warn('Cache busting disabled - no webhook password configured');
      return null;
    }

    try {
      const response = await fetch(`${this.frontendUrl}/api/cache-bust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.webhookPassword}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json() as WebhookResponse;

      console.log('Cache bust successful:', {
        payload,
        clearedKeys: responseData.clearedKeys,
        timestamp: responseData.timestamp,
      });

      return responseData;
    } catch (error) {
      console.error('Cache bust failed:', {
        payload,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Bust site-options cache for specific language
   */
  async bustSiteOptionsCache(language?: string): Promise<WebhookResponse | null> {
    return this.triggerCacheBust({
      dataType: 'site-options',
      language,
    });
  }

  /**
   * Bust menu cache (actually busts site-options since menus are part of site options)
   */
  async bustMenuCache(language?: string): Promise<WebhookResponse | null> {
    // Menus are part of site options, so we bust site-options cache
    return this.triggerCacheBust({
      dataType: 'menus',
      language,
    });
  }

  /**
   * Bust redirects cache
   */
  async bustRedirectsCache(): Promise<WebhookResponse | null> {
    return this.triggerCacheBust({
      dataType: 'redirects',
    });
  }

  /**
   * Bust all caches
   */
  async bustAllCaches(): Promise<WebhookResponse | null> {
    return this.triggerCacheBust({
      dataType: 'all',
    });
  }

  /**
   * Bust specific cache keys
   */
  async bustSpecificKeys(keys: string[]): Promise<WebhookResponse | null> {
    return this.triggerCacheBust({
      specificKeys: keys,
    });
  }
}

// Export singleton instance
export const cacheBustService = new CacheBustService(); 