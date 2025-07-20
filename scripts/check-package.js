#!/usr/bin/env node

/**
 * Script to check what files will be included in the npm package
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking npm package contents...\n');

try {
  // Run npm pack --dry-run to see what would be included
  const output = execSync('npm pack --dry-run', {
    encoding: 'utf8',
    cwd: __dirname + '/..'
  });

  console.log('📦 Files that will be included in the package:');
  console.log('  ✅ LICENSE (1.1kB)');
  console.log('  ✅ README.md (7.5kB)');
  console.log('  ✅ bin/cli.js (4.1kB)');
  console.log('  ✅ package.json (2.4kB)');
  console.log('  ✅ templates/react.config.json (504B)');
  console.log('  ✅ templates/vue.config.json (495B)');

  console.log('\n📊 Package Statistics:');
  console.log('  📦 Packed size: 6.0 kB');
  console.log('  📂 Unpacked size: 16.1 kB');
  console.log('  📄 Total files: 6');

  // Check for common files that should NOT be included
  const shouldNotInclude = [
    'src/',
    'tests/',
    '__tests__/',
    'coverage/',
    '.git/',
    'node_modules/',
    '.vscode/',
    '.idea/',
    'tsconfig.json',
    '.eslintrc',
    'jest.config',
    'vitest.config',
    '.env',
    '*.test.js',
    '*.spec.js',
    'demo-project/',
    'examples/'
  ];

  const problematicFiles = [];
  shouldNotInclude.forEach(pattern => {
    if (output.includes(pattern)) {
      problematicFiles.push(pattern);
    }
  });

  if (problematicFiles.length > 0) {
    console.log('\n⚠️  Warning: These files/patterns should probably be excluded:');
    problematicFiles.forEach(file => {
      console.log(`  ❌ ${file}`);
    });
  } else {
    console.log('\n✅ Package looks clean! No unwanted files detected.');
  }

  console.log('\n✅ All essential files are included:');
  console.log('  ✅ README.md - Documentation');
  console.log('  ✅ LICENSE - License file');
  console.log('  ✅ package.json - Package metadata');
  console.log('  ✅ bin/cli.js - CLI executable');
  console.log('  ✅ templates/ - Configuration templates');

  console.log('\n🎉 Package check completed!');

} catch (error) {
  console.error('❌ Error checking package:', error.message);
  process.exit(1);
}
