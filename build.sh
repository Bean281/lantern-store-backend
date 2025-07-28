#!/bin/bash

echo "=== Starting build process ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo "=== Installing dependencies ==="
npm ci

echo "=== Building application ==="
npm run build

echo "=== Generating Prisma client ==="
npx prisma generate

echo "=== Verifying build output ==="
ls -la
echo "Checking dist folder:"
ls -la dist/ || echo "Dist folder not found"

echo "=== Build completed successfully ===" 