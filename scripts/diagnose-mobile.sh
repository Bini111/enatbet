#!/bin/bash

# Enatbet Mobile App Diagnostic Script
# This will identify all issues with your React Native setup

echo "🔍 Enatbet Mobile App Diagnostic Tool"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Not in project root. Please run from ~/Desktop/enatbet${NC}"
    exit 1
fi

echo "📁 Checking project structure..."
echo "--------------------------------"

# Check if monorepo directories exist
if [ -d "apps/mobile" ]; then
    echo -e "${GREEN}✅ Mobile app directory exists${NC}"
else
    echo -e "${RED}❌ Mobile app directory missing${NC}"
fi

if [ -d "packages/shared" ]; then
    echo -e "${GREEN}✅ Shared package exists${NC}"
else
    echo -e "${RED}❌ Shared package missing${NC}"
fi

echo ""
echo "📦 Checking React versions..."
echo "-----------------------------"

# Check React versions across the monorepo
echo "React versions in your monorepo:"

# Root package.json
if [ -f "package.json" ]; then
    ROOT_REACT=$(grep '"react":' package.json | head -1 | awk -F'"' '{print $4}')
    echo "  Root: ${ROOT_REACT:-none}"
fi

# Web app
if [ -f "apps/web/package.json" ]; then
    WEB_REACT=$(grep '"react":' apps/web/package.json | head -1 | awk -F'"' '{print $4}')
    echo "  Web:  ${WEB_REACT:-none}"
fi

# Mobile app
if [ -f "apps/mobile/package.json" ]; then
    MOBILE_REACT=$(grep '"react":' apps/mobile/package.json | head -1 | awk -F'"' '{print $4}')
    echo "  Mobile: ${MOBILE_REACT:-none}"
fi

# Check for React duplicates in node_modules
echo ""
echo "🔍 Checking for duplicate React installations..."
echo "-----------------------------------------------"

REACT_COUNT=$(find . -name "react" -type d -path "*/node_modules/*" ! -path "*/node_modules/*/node_modules/*" 2>/dev/null | wc -l)
echo "Found $REACT_COUNT React installations in node_modules"

if [ "$REACT_COUNT" -gt 1 ]; then
    echo -e "${YELLOW}⚠️  Multiple React versions detected - this causes hooks errors${NC}"
    echo "Locations:"
    find . -name "react" -type d -path "*/node_modules/*" ! -path "*/node_modules/*/node_modules/*" 2>/dev/null | head -5
fi

echo ""
echo "📱 Checking Expo and Metro configuration..."
echo "------------------------------------------"

# Check if metro.config.js exists
if [ -f "apps/mobile/metro.config.js" ]; then
    echo -e "${GREEN}✅ Metro config exists${NC}"
    
    # Check if it has monorepo configuration
    if grep -q "watchFolders" apps/mobile/metro.config.js; then
        echo -e "${GREEN}✅ Metro has monorepo watch folders${NC}"
    else
        echo -e "${RED}❌ Metro missing monorepo configuration${NC}"
    fi
else
    echo -e "${RED}❌ Metro config missing${NC}"
fi

# Check Expo SDK version
if [ -f "apps/mobile/package.json" ]; then
    EXPO_VERSION=$(grep '"expo":' apps/mobile/package.json | head -1 | awk -F'"' '{print $4}')
    echo "Expo SDK version: ${EXPO_VERSION:-not found}"
fi

echo ""
echo "🔧 Checking pnpm workspace configuration..."
echo "-------------------------------------------"

# Check if pnpm-workspace.yaml exists
if [ -f "pnpm-workspace.yaml" ]; then
    echo -e "${GREEN}✅ pnpm workspace file exists${NC}"
else
    echo -e "${YELLOW}⚠️  pnpm-workspace.yaml missing${NC}"
fi

# Check .npmrc for hoisting rules
if [ -f ".npmrc" ]; then
    echo -e "${GREEN}✅ .npmrc exists${NC}"
    if grep -q "shamefully-hoist" .npmrc; then
        echo "  - Has shamefully-hoist setting"
    fi
    if grep -q "public-hoist-pattern" .npmrc; then
        echo "  - Has public-hoist-pattern for React Native"
    fi
else
    echo -e "${YELLOW}⚠️  .npmrc missing - needed for React Native monorepo${NC}"
fi

echo ""
echo "🏥 Quick Health Check Summary"
echo "=============================="

ISSUES=0

# Check for common issues
if [ "$REACT_COUNT" -gt 1 ]; then
    echo -e "${RED}❌ Issue 1: Multiple React versions (causes hooks error)${NC}"
    ISSUES=$((ISSUES + 1))
fi

if [ ! -f "apps/mobile/metro.config.js" ] || ! grep -q "watchFolders" apps/mobile/metro.config.js 2>/dev/null; then
    echo -e "${RED}❌ Issue 2: Metro not configured for monorepo${NC}"
    ISSUES=$((ISSUES + 1))
fi

if [ ! -f ".npmrc" ] || ! grep -q "public-hoist-pattern" .npmrc 2>/dev/null; then
    echo -e "${RED}❌ Issue 3: Missing React Native hoisting configuration${NC}"
    ISSUES=$((ISSUES + 1))
fi

if [ ! -f "pnpm-workspace.yaml" ]; then
    echo -e "${RED}❌ Issue 4: Missing pnpm workspace configuration${NC}"
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ No major issues detected!${NC}"
else
    echo ""
    echo -e "${YELLOW}Found $ISSUES issues that need fixing${NC}"
fi

echo ""
echo "📋 Next Steps:"
echo "--------------"
echo "1. Save this diagnostic output"
echo "2. Share the results with me"
echo "3. We'll fix each issue one by one"
echo ""
echo "To run mobile app after fixes:"
echo "  cd apps/mobile"
echo "  npx expo start --clear"
