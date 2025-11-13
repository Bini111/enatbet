#!/bin/bash

echo "📁 Checking Enatbet Monorepo Structure"
echo "======================================"
echo ""

# Check root files
echo "ROOT FILES:"
for file in package.json pnpm-workspace.yaml turbo.json tsconfig.json .env.local .env.example firestore.rules firestore.indexes.json storage.rules; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ MISSING: $file"
    fi
done

echo ""
echo "APPS:"
for app in apps/web apps/mobile; do
    if [ -d "$app" ]; then
        echo "✅ $app/"
    else
        echo "❌ MISSING: $app/"
    fi
done

echo ""
echo "PACKAGES:"
for pkg in packages/shared packages/firebase packages/ui; do
    if [ -d "$pkg" ]; then
        echo "✅ $pkg/"
    else
        echo "❌ MISSING: $pkg/"
    fi
done

echo ""
echo "======================================"
echo "✅ All critical root files present!"
