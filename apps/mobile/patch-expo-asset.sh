#!/bin/bash
BUILD_DIR="node_modules/expo-asset/build"

echo "Patching all .js files in expo-asset..."

# Find all .js files (not .map files) and add .js extensions to relative imports
find "$BUILD_DIR" -name "*.js" -not -name "*.map" | while read file; do
  echo "Patching: $file"
  # Add .js to all relative imports that don't already have it
  sed -i '' -E "s|from '(\./[^']+)'|from '\1.js'|g" "$file"
  sed -i '' -E 's|from "(\./[^"]+)"|from "\1.js"|g' "$file"
  # Fix double .js.js if any
  sed -i '' 's|\.js\.js|.js|g' "$file"
done

echo "✅ Patching complete!"
