#!/bin/bash

# React i18n Demo Setup Script

echo "🚀 Setting up React i18n Demo Project..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm found"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if all required files exist
echo ""
echo "🔍 Checking project structure..."

required_files=(
    "src/App.jsx"
    "src/main.jsx"
    "src/components/LanguageSwitcher.jsx"
    "src/components/HOCDemo.jsx"
    "src/components/HookDemo.jsx"
    "src/utils/LS.js"
    "src/redux/store.js"
    "src/localized/strings/zh_hans.js"
    "src/localized/strings/en.js"
)

all_files_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - Missing!"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = true ]; then
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Run: pnpm dev (start development server)"
    echo "  2. Open: http://localhost:3000"
    echo "  3. Test: Language switching with the buttons"
    echo "  4. Scan: npx i18n-scanner scan (test the scanner)"
    echo ""
    echo "🌍 Features to test:"
    echo "  - Language switching (中文 ↔ English)"
    echo "  - HOC Demo component"
    echo "  - Hook Demo component"
    echo "  - Missing translation detection"
else
    echo ""
    echo "❌ Setup incomplete - some files are missing"
    exit 1
fi
