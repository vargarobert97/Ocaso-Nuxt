#!/bin/bash

echo "🧪 Running tests before push..."

# Run all tests
npm run test

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ All tests passed! Proceeding with push..."
    exit 0
else
    echo "❌ Tests failed! Please fix the issues before pushing."
    exit 1
fi 