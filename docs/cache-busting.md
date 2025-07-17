# Cache Busting System

This document describes the webhook-based cache busting system that automatically clears frontend caches when content is updated in Strapi.

## Overview

The cache busting system consists of:
- **Frontend webhook endpoint**: Secured endpoint that clears specific caches
- **Backend service**: Handles webhook calls to the frontend
- **Lifecycle hooks**: Automatically trigger cache busting on content updates
- **Sophisticated invalidation**: Support for data type, language, and specific key invalidation

## Environment Variables

Add these to your environment files:

```bash
# Cache Busting Webhook
CACHE_BUST_WEBHOOK_PASSWORD=your-secure-webhook-password
FRONTEND_URL=http://localhost:3000
```

## Webhook Endpoint

**URL**: `POST /api/cache-bust`

**Authentication**: Bearer token with `CACHE_BUST_WEBHOOK_PASSWORD`

**Payload**:
```typescript
{
  dataType?: 'site-options' | 'redirects' | 'all';
  language?: string;
  specificKeys?: string[];
}
```

### Examples

```bash
# Bust site-options for German
curl -X POST http://localhost:3000/api/cache-bust \
  -H "Authorization: Bearer your-password" \
  -H "Content-Type: application/json" \
  -d '{"dataType": "site-options", "language": "de"}'

# Bust all site-options
curl -X POST http://localhost:3000/api/cache-bust \
  -H "Authorization: Bearer your-password" \
  -H "Content-Type: application/json" \
  -d '{"dataType": "site-options"}'

# Bust redirects
curl -X POST http://localhost:3000/api/cache-bust \
  -H "Authorization: Bearer your-password" \
  -H "Content-Type: application/json" \
  -d '{"dataType": "redirects"}'

# Bust specific cache keys
curl -X POST http://localhost:3000/api/cache-bust \
  -H "Authorization: Bearer your-password" \
  -H "Content-Type: application/json" \
  -d '{"specificKeys": ["site-options-de", "site-options-en", "redirects"]}'

# Bust all caches
curl -X POST http://localhost:3000/api/cache-bust \
  -H "Authorization: Bearer your-password" \
  -H "Content-Type: application/json" \
  -d '{"dataType": "all"}'
```

## Automatic Cache Busting

The system automatically clears caches when:

### Site Options
- **After Update**: Clears cache for the specific language
- **Global Changes**: Clears all languages if `siteLogo` or `favicon` are updated
- **After Create**: Clears cache for the new language
- **After Delete**: Clears all site-options caches

### Cache Keys

The system manages these cache keys:
- `site-options-{language}` - Client-side site options cache
- `server-site-options-{language}` - Server-side site options cache
- `redirects` - Redirects cache

## Testing

Use the test script to verify the webhook works:

```bash
# Test with environment variables
npm run test:cache-bust

# Test with explicit parameters
node scripts/test-cache-bust.js your-password http://localhost:3000
```

## Manual Cache Busting

You can manually trigger cache busting from the backend:

```typescript
import { cacheBustService } from './services/cache-bust-service';

// Bust site-options for specific language
await cacheBustService.bustSiteOptionsCache('de');

// Bust all site-options
await cacheBustService.bustSiteOptionsCache();

// Bust all caches
await cacheBustService.bustAllCaches();

// Bust redirects cache
await cacheBustService.bustRedirectsCache();

// Bust specific keys
await cacheBustService.bustSpecificKeys(['site-options-de', 'site-options-en', 'redirects']);
```

## Security

- Webhook password validation prevents unauthorized cache clearing
- Only POST requests are accepted
- Payload validation ensures only expected cache keys are cleared
- No sensitive data is exposed in the cache invalidation payload

## Troubleshooting

### Webhook not working
1. Check `CACHE_BUST_WEBHOOK_PASSWORD` is set
2. Verify `FRONTEND_URL` is correct
3. Ensure frontend is running and accessible
4. Check network connectivity between backend and frontend

### Cache not clearing
1. Verify the webhook is being called (check backend logs)
2. Check frontend logs for webhook errors
3. Verify cache keys match expected format
4. Test with the test script

### Performance considerations
- Webhook calls are asynchronous and don't block content updates
- Failed webhook calls are logged but don't prevent content updates
- Consider rate limiting for high-frequency updates 