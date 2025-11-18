#!/bin/bash

echo "🔍 Enatbet Monorepo Health Check"
echo "================================="

# 1. Check workspace setup
echo -e "\n📦 Workspace Configuration:"
if [ -f "pnpm-workspace.yaml" ]; then
  echo "✓ pnpm-workspace.yaml exists"
  cat pnpm-workspace.yaml
else
  echo "✗ pnpm-workspace.yaml missing"
fi

# 2. Check React versions
echo -e "\n⚛️  React Version Analysis:"
pnpm list react react-native --depth=0 --recursive | grep -E "react@|react-native@" | sort | uniq -c

# 3. Check for node_modules in unexpected places
echo -e "\n📁 Node_modules locations:"
find . -type d -name "node_modules" -not -path "*/node_modules/*" 2>/dev/null

# 4. Check TypeScript setup
echo -e "\n🔷 TypeScript References:"
if [ -f "tsconfig.json" ]; then
  grep -l '"references"' tsconfig.json apps/*/tsconfig.json packages/*/tsconfig.json 2>/dev/null || echo "No TS project references found"
fi

# 5. Check Turbo configuration
echo -e "\n🚀 Turbo Pipeline:"
if [ -f "turbo.json" ]; then
  grep -A5 '"pipeline"' turbo.json
else
  echo "✗ turbo.json missing"
fi

# 6. Environment variables
echo -e "\n🔐 Environment Setup:"
[ -f ".env.example" ] && echo "✓ .env.example exists" || echo "✗ .env.example missing"
[ -f ".env.local" ] && echo "✓ .env.local exists" || echo "✗ .env.local missing"

echo -e "\n✅ Health check complete!"
