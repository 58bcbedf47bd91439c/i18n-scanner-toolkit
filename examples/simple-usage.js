/**
 * Simple usage examples for @i18n-toolkit/scanner
 * Updated for the new API (v1.0.0)
 */

const { I18nScanner } = require('@i18n-toolkit/scanner');

// Example 1: Basic scan and get missing translations
async function basicScan() {
  console.log('🚀 Basic scan example...\n');

  const config = {
    framework: 'custom',
    sourceDir: 'src',
    localeDir: 'src/localized/strings',
    extractPattern: /\$LS\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
    ignoreKeyPatterns: ['src', 'components']
  };

  const scanner = new I18nScanner(config);

  // Get missing translations as JSON
  const missingTranslations = await scanner.scanAll();

  console.log('📊 Missing translations:');
  console.log(JSON.stringify(missingTranslations, null, 2));

  return missingTranslations;
}

// Example 2: Export to CSV
async function exportToCsv() {
  console.log('📤 Export to CSV example...\n');

  const config = {
    framework: 'react',
    sourceDir: 'src',
    localeDir: 'src/i18n',
    extractPattern: /t\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g
  };

  const scanner = new I18nScanner(config);

  // Export all translations to CSV
  const csvPath = await scanner.export('./translations.csv');
  console.log(`✅ Exported to: ${csvPath}`);

  return csvPath;
}

// Example 3: Import from CSV
async function importFromCsv() {
  console.log('📥 Import from CSV example...\n');

  const config = {
    framework: 'vue',
    sourceDir: 'src',
    localeDir: 'src/locales',
    extractPattern: /\$t\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g
  };

  const scanner = new I18nScanner(config);

  try {
    // Import translations from CSV
    await scanner.import('./translations.csv');
    console.log('✅ Successfully imported translations');
  } catch (error) {
    console.log('⚠️ Import failed:', error.message);
  }
}

// Example 4: Complete workflow
async function completeWorkflow() {
  console.log('🔄 Complete workflow example...\n');

  const config = {
    framework: 'custom',
    sourceDir: 'src',
    localeDir: 'src/localized/strings',
    extractPattern: /\$LS\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
    ignoreKeyPatterns: ['src', 'components']
  };

  const scanner = new I18nScanner(config);

  // 1. Scan for missing translations
  console.log('1️⃣ Scanning for missing translations...');
  const missing = await scanner.scanAll();
  console.log(`Found ${Object.keys(missing).length} missing translations`);

  // 2. Export to CSV for translation
  console.log('2️⃣ Exporting to CSV...');
  const csvPath = await scanner.export();
  console.log(`Exported to: ${csvPath}`);

  // 3. Import would happen after manual translation
  console.log('3️⃣ After manual translation, import with:');
  console.log(`   await scanner.import('${csvPath}')`);

  return { missing, csvPath };
}

// Run examples
async function runExamples() {
  try {
    console.log('🌍 @i18n-toolkit/scanner - Simple Usage Examples (v1.0.0)\n');
    console.log('='.repeat(60));

    // Run the basic scan example
    await basicScan();

    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Available examples:');
    console.log('- basicScan() - Get missing translations as JSON');
    console.log('- exportToCsv() - Export translations to CSV');
    console.log('- importFromCsv() - Import translations from CSV');
    console.log('- completeWorkflow() - Full translation workflow');

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.message.includes('does not exist')) {
      console.log('\n💡 Tip: Make sure you\'re running this in a project directory with:');
      console.log('  - Source files containing translatable text');
      console.log('  - Language files in the specified locale directory');
    }
  }
}

// Export functions for use in other modules
module.exports = {
  basicScan,
  exportToCsv,
  importFromCsv,
  completeWorkflow
};

// Run if called directly
if (require.main === module) {
  runExamples();
}
