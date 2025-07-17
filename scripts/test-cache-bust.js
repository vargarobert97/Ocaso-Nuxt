#!/usr/bin/env node

/**
 * Test script for cache busting webhook
 * Usage: node scripts/test-cache-bust.js [password] [frontend-url]
 */

import { $fetch } from 'ofetch';

const webhookPassword = process.argv[2] || process.env.CACHE_BUST_WEBHOOK_PASSWORD;
const frontendUrl = process.argv[3] || process.env.FRONTEND_URL || 'http://localhost:3000';

if (!webhookPassword) {
  console.error('❌ Webhook password not provided');
  console.log('Usage: node scripts/test-cache-bust.js [password] [frontend-url]');
  console.log('Or set CACHE_BUST_WEBHOOK_PASSWORD environment variable');
  process.exit(1);
}

async function testCacheBust() {
  console.log('🧪 Testing cache busting webhook...');
  console.log(`📍 Frontend URL: ${frontendUrl}`);
  console.log(`🔑 Using password: ${webhookPassword.substring(0, 8)}...`);
  console.log('');

  const testCases = [
    {
      name: 'Bust site-options for German',
      payload: { dataType: 'site-options', language: 'de' }
    },
    {
      name: 'Bust site-options for English',
      payload: { dataType: 'site-options', language: 'en' }
    },
    {
      name: 'Bust all site-options',
      payload: { dataType: 'site-options' }
    },
    {
      name: 'Bust menus for German',
      payload: { dataType: 'menus', language: 'de' }
    },
    {
      name: 'Bust menus for English',
      payload: { dataType: 'menus', language: 'en' }
    },
    {
      name: 'Bust all menus',
      payload: { dataType: 'menus' }
    },
    {
      name: 'Bust redirects',
      payload: { dataType: 'redirects' }
    },
    {
      name: 'Bust specific keys',
      payload: { specificKeys: ['site-options-de', 'site-options-en', 'redirects'] }
    },
    {
      name: 'Bust all caches',
      payload: { dataType: 'all' }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📝 Testing: ${testCase.name}`);
      
      const response = await $fetch(`${frontendUrl}/api/cache-bust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${webhookPassword}`,
        },
        body: testCase.payload,
      });

      console.log(`✅ Success: ${response.message}`);
      console.log(`   Cleared keys: ${response.clearedKeys.join(', ')}`);
      console.log(`   Timestamp: ${response.timestamp}`);
      console.log('');
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Body: ${JSON.stringify(error.response._data, null, 2)}`);
      }
      console.log('');
    }
  }
}

testCacheBust().catch(console.error); 