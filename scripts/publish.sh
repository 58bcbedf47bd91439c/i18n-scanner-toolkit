#!/bin/bash

# i18n-toolkit/scanner publish script

set -e

echo "🚀 Publishing @i18n-toolkit/scanner"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Run this script from the project root."
  exit 1
fi

# Check if we're on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
  echo "⚠️  Warning: You're not on main/master branch (current: $BRANCH)"
  read -p "Continue anyway? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Error: You have uncommitted changes. Please commit or stash them first."
  git status --short
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Run tests
echo "🧪 Running tests..."
pnpm test

# Run linting
echo "🔍 Running linter..."
pnpm lint

# Type check
echo "📝 Type checking..."
pnpm type-check

# Build the project
echo "🔨 Building project..."
pnpm build

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

# Ask for version bump
echo "🔢 Select version bump:"
echo "1) patch (bug fixes)"
echo "2) minor (new features)"
echo "3) major (breaking changes)"
echo "4) custom"
echo "5) skip version bump"

read -p "Enter choice (1-5): " VERSION_CHOICE

case $VERSION_CHOICE in
  1)
    NEW_VERSION=$(npm version patch --no-git-tag-version)
    ;;
  2)
    NEW_VERSION=$(npm version minor --no-git-tag-version)
    ;;
  3)
    NEW_VERSION=$(npm version major --no-git-tag-version)
    ;;
  4)
    read -p "Enter new version: " CUSTOM_VERSION
    NEW_VERSION=$(npm version $CUSTOM_VERSION --no-git-tag-version)
    ;;
  5)
    NEW_VERSION="v$CURRENT_VERSION"
    echo "Skipping version bump"
    ;;
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo "📦 New version: $NEW_VERSION"

# Update changelog (if exists)
if [ -f "CHANGELOG.md" ]; then
  echo "📝 Please update CHANGELOG.md with the new version changes"
  read -p "Press enter when ready to continue..."
fi

# Commit version bump (if version was changed)
if [ "$VERSION_CHOICE" != "5" ]; then
  git add package.json
  git commit -m "chore: bump version to $NEW_VERSION"
  git tag "$NEW_VERSION"
fi

# Final confirmation
echo "🚨 Ready to publish $NEW_VERSION to npm"
echo "📦 Package: @i18n-toolkit/scanner"
echo "🏷️  Tag: $NEW_VERSION"
read -p "Continue with publish? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Publish cancelled"
  exit 1
fi

# Publish to npm
echo "🚀 Publishing to npm..."
npm publish --access public

# Push to git
if [ "$VERSION_CHOICE" != "5" ]; then
  echo "📤 Pushing to git..."
  git push origin main --tags
fi

echo "✅ Successfully published @i18n-toolkit/scanner $NEW_VERSION!"
echo "🎉 Package is now available at: https://www.npmjs.com/package/@i18n-toolkit/scanner"

# Show next steps
echo ""
echo "📋 Next steps:"
echo "1. Update documentation if needed"
echo "2. Create GitHub release with changelog"
echo "3. Announce on social media/community"
echo "4. Update dependent projects"
