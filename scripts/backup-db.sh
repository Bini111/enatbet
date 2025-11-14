#!/bin/bash

# Backup Firestore Database
# Usage: ./scripts/backup-db.sh [bucket-name]

set -e

# Default bucket or use provided argument
BUCKET=${1:-"gs://enatebet-backups"}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_PATH="$BUCKET/firestore-backup-$TIMESTAMP"

echo "💾 Backing up Firestore database..."
echo "Destination: $BACKUP_PATH"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo "❌ gcloud CLI not found. Please install Google Cloud SDK."
  echo "Visit: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
  echo "❌ Not authenticated with gcloud. Please run: gcloud auth login"
  exit 1
fi

# Get project ID from Firebase config or environment
PROJECT_ID=${FIREBASE_PROJECT_ID:-$(gcloud config get-value project)}

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Project ID not found. Please set FIREBASE_PROJECT_ID or configure gcloud project."
  exit 1
fi

echo "📦 Project: $PROJECT_ID"

# Create backup
echo "🚀 Starting backup export..."
gcloud firestore export $BACKUP_PATH \
  --project=$PROJECT_ID \
  --async

echo "✅ Backup initiated successfully!"
echo "📋 Backup location: $BACKUP_PATH"
echo "⏳ The backup is running asynchronously. Monitor progress:"
echo "   gcloud firestore operations list --project=$PROJECT_ID"
echo ""
echo "💡 To restore this backup, run:"
echo "   gcloud firestore import $BACKUP_PATH --project=$PROJECT_ID"
