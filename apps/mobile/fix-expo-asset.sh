#!/bin/bash
INDEX_FILE="node_modules/expo-asset/build/index.js"
if [ -f "$INDEX_FILE" ]; then
  sed -i '' "s|from './Asset.fx'|from './Asset.fx.js'|g" "$INDEX_FILE"
  sed -i '' 's|from "./Asset.fx"|from "./Asset.fx.js"|g' "$INDEX_FILE"
  echo "✅ Patched expo-asset/build/index.js"
  echo "Checking patch..."
  grep "Asset.fx" "$INDEX_FILE"
else
  echo "❌ File not found"
fi
