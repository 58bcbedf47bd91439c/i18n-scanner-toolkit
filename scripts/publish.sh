#!/bin/bash

# i18n-scanner-toolkit publish script

set -e

echo "🚀 Publishing i18n-scanner-toolkit"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Run this script from the project root."
  exit 1
fi

# Check if we're on main branch (required)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
  echo "❌ Error: Must be on main/master branch (current: $BRANCH)"
  exit 1
fi

# Check for uncommitted changes (required)
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Error: You have uncommitted changes. Please commit or stash them first."
  git status --short
  exit 1
fi

# Check if working directory is clean (required)
if ! git diff-index --quiet HEAD --; then
  echo "❌ Error: Working directory is not clean. Please commit all changes first."
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running linter..."
npm run lint

# Type check
echo "📝 Type checking..."
npm run type-check

# Build the project
echo "🔨 Building project..."
npm run build

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "❌ Error: dist directory not found after build"
  exit 1
fi

# Validate package
echo "✅ Validating package..."
npm pack --dry-run

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📋 Current version: $CURRENT_VERSION"

# Version bump is required - default to patch
echo "🔢 Bumping version (patch)..."
NEW_VERSION=$(npm version patch --no-git-tag-version)
echo "📦 New version: $NEW_VERSION"

# Commit version bump (required)
echo "📝 Committing version bump..."
git add package.json
git commit -m "chore: bump version to $NEW_VERSION"
git tag "$NEW_VERSION"

# Auto-publish without confirmation
echo "🚨 Publishing $NEW_VERSION to npm"
echo "📦 Package: i18n-scanner-toolkit"
echo "🏷️  Tag: $NEW_VERSION"

# Publish to npm
echo "🚀 Publishing to npm..."
npm publish

# Push to git (required)
echo "📤 Pushing to git..."
git push origin main --tags

echo "✅ Successfully published i18n-scanner-toolkit $NEW_VERSION!"
echo "🎉 Package is now available at: https://www.npmjs.com/package/i18n-scanner-toolkit"
