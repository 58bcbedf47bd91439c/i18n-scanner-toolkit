#!/usr/bin/env node

/**
 * Build script for @i18n-toolkit/scanner using Vite
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('🔨 Building @i18n-toolkit/scanner with Vite\n'));

// Clean dist directory
console.log(chalk.blue('🧹 Cleaning dist directory...'));
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

try {
  // Build main library
  console.log(chalk.blue('📦 Building main library...'));
  execSync('vite build', { stdio: 'inherit' });
  
  // Build CLI
  console.log(chalk.blue('🛠️  Building CLI...'));
  execSync('vite build --config vite.config.cli.ts', { stdio: 'inherit' });
  
  // Verify build outputs
  console.log(chalk.blue('✅ Verifying build outputs...'));
  
  const requiredFiles = [
    'dist/index.js',
    'dist/index.esm.js',
    'dist/index.d.ts',
    'dist/cli/index.js'
  ];
  
  let allFilesExist = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      console.log(chalk.green(`  ✅ ${file} (${(stats.size / 1024).toFixed(1)}KB)`));
    } else {
      console.log(chalk.red(`  ❌ ${file} - Missing!`));
      allFilesExist = false;
    }
  });
  
  if (!allFilesExist) {
    throw new Error('Some build outputs are missing');
  }
  
  // Check CLI executable
  console.log(chalk.blue('🔍 Checking CLI executable...'));
  const cliPath = 'bin/cli.js';
  if (fs.existsSync(cliPath)) {
    const stats = fs.statSync(cliPath);
    const isExecutable = (stats.mode & parseInt('111', 8)) !== 0;
    if (isExecutable) {
      console.log(chalk.green(`  ✅ ${cliPath} is executable`));
    } else {
      console.log(chalk.yellow(`  ⚠️  ${cliPath} is not executable, fixing...`));
      fs.chmodSync(cliPath, '755');
    }
  }
  
  // Show build summary
  console.log(chalk.green('\n🎉 Build completed successfully!'));
  
  // Calculate total size
  let totalSize = 0;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      totalSize += fs.statSync(file).size;
    }
  });
  
  console.log(chalk.blue(`📊 Total build size: ${(totalSize / 1024).toFixed(1)}KB`));
  
  // Show next steps
  console.log(chalk.blue('\n📋 Next steps:'));
  console.log('  1. Run tests: pnpm test');
  console.log('  2. Test CLI: node bin/cli.js --help');
  console.log('  3. Publish: npm publish --access public');
  
} catch (error) {
  console.error(chalk.red('\n❌ Build failed:'), error.message);
  process.exit(1);
}
