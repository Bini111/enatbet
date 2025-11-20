#!/bin/bash

echo "🚀 Starting Enatbet Development Environment"
echo ""
echo "Choose what to start:"
echo "1) Web App (localhost:3000)"
echo "2) Mobile Dev Server (Expo - localhost:8081)"
echo "3) iOS Simulator"
echo "4) Android Emulator"
echo "5) ALL (Web + Mobile)"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
  1)
    echo "Starting Web App..."
    cd ~/Desktop/enatbet/apps/web && pnpm dev
    ;;
  2)
    echo "Starting Mobile Dev Server..."
    cd ~/Desktop/enatbet/apps/mobile && pnpm start
    ;;
  3)
    echo "Starting iOS Simulator..."
    cd ~/Desktop/enatbet/apps/mobile && pnpm ios
    ;;
  4)
    echo "Starting Android Emulator..."
    cd ~/Desktop/enatbet/apps/mobile && pnpm android
    ;;
  5)
    echo "Starting Web and Mobile..."
    cd ~/Desktop/enatbet/apps/web && pnpm dev &
    cd ~/Desktop/enatbet/apps/mobile && pnpm start
    ;;
  *)
    echo "Invalid choice"
    ;;
esac
