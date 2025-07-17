#!/bin/bash

# Pre-commit hook to generate TypeScript types from Strapi schema
# This ensures types are always up to date before commits

echo "🔍 Checking for Strapi schema changes..."

# Check if backend schema files have changed
if git diff --cached --name-only | grep -q "backend/src/api/.*/content-types/.*/schema.json"; then
    echo "📝 Strapi schema changes detected, generating types..."
    
    # Generate types
    npm run generate-types
    
    # Add generated types to commit
    if [ -f "frontend/types/strapi.ts" ]; then
        git add frontend/types/strapi.ts
        echo "✅ Types generated and added to commit"
    else
        echo "⚠️  No types generated, continuing..."
    fi
else
    echo "✅ No schema changes detected"
fi 