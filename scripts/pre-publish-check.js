#!/usr/bin/env node

/**
 * Pre-publish check script for @i18n-toolkit/scanner
 * Validates package structure and configuration before publishing
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('🔍 Pre-publish Check for @i18n-toolkit/scanner\n'));

let hasErrors = false;

function checkError(condition, message) {
  if (!condition) {
    console.log(chalk.red('❌ ' + message));
    hasErrors = true;
  } else {
    console.log(chalk.green('✅ ' + message));
  }
}

function checkWarning(condition, message) {
  if (!condition) {
    console.log(chalk.yellow('⚠️  ' + message));
  } else {
    console.log(chalk.green('✅ ' + message));
  }
}

// Check package.json
console.log(chalk.blue('📦 Checking package.json...'));
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

checkError(packageJson.name === '@i18n-toolkit/scanner', 'Package name is correct');
checkError(packageJson.version && packageJson.version !== '0.0.0', 'Version is set');
checkError(packageJson.description && packageJson.description.length > 10, 'Description is meaningful');
checkError(packageJson.main === 'dist/index.js', 'Main entry point is correct');
checkError(packageJson.module === 'dist/index.esm.js', 'ESM entry point is correct');
checkError(packageJson.types === 'dist/index.d.ts', 'Types entry point is correct');
checkError(packageJson.bin && packageJson.bin['i18n-scanner'], 'CLI binary is configured');
checkError(Array.isArray(packageJson.keywords) && packageJson.keywords.length > 5, 'Keywords are set');
checkError(packageJson.license === 'MIT', 'License is set');
checkError(packageJson.repository && packageJson.repository.url, 'Repository URL is set');

// Check required files
console.log(chalk.blue('\n📁 Checking required files...'));
const requiredFiles = [
  'README.md',
  'LICENSE',
  'QUICK_START.md',
  'bin/cli.js',
  'src/index.ts',
  'src/types/index.ts',
  'src/core/Scanner.ts',
  'tsconfig.json',
  'rollup.config.js'
];

requiredFiles.forEach(file => {
  checkError(fs.existsSync(file), `${file} exists`);
});

// Check build output
console.log(chalk.blue('\n🔨 Checking build output...'));
const buildFiles = [
  'dist/index.js',
  'dist/index.esm.js',
  'dist/index.d.ts',
  'dist/cli/index.js'
];

buildFiles.forEach(file => {
  checkError(fs.existsSync(file), `${file} exists`);
});

// Check CLI executable
console.log(chalk.blue('\n🛠️  Checking CLI...'));
const cliFile = 'bin/cli.js';
if (fs.existsSync(cliFile)) {
  const cliContent = fs.readFileSync(cliFile, 'utf8');
  checkError(cliContent.startsWith('#!/usr/bin/env node'), 'CLI has correct shebang');
  checkError(cliContent.includes('@i18n-toolkit/scanner'), 'CLI references correct package');
}

// Check TypeScript types
console.log(chalk.blue('\n📝 Checking TypeScript types...'));
if (fs.existsSync('dist/index.d.ts')) {
  const typesContent = fs.readFileSync('dist/index.d.ts', 'utf8');
  checkError(typesContent.includes('export'), 'Types file has exports');
  checkError(typesContent.includes('I18nScanner'), 'Main class is exported');
}

// Check examples
console.log(chalk.blue('\n📋 Checking examples...'));
checkWarning(fs.existsSync('examples/react-usage.js'), 'React example exists');
checkWarning(fs.existsSync('examples/vue-usage.js'), 'Vue example exists');

// Check documentation
console.log(chalk.blue('\n📚 Checking documentation...'));
if (fs.existsSync('README.md')) {
  const readmeContent = fs.readFileSync('README.md', 'utf8');
  checkError(readmeContent.includes('@i18n-toolkit/scanner'), 'README mentions package name');
  checkError(readmeContent.includes('npm install'), 'README has installation instructions');
  checkError(readmeContent.includes('i18n-scanner'), 'README mentions CLI commands');
  checkWarning(readmeContent.length > 2000, 'README is comprehensive');
}

// Check .npmignore
console.log(chalk.blue('\n📦 Checking .npmignore...'));
if (fs.existsSync('.npmignore')) {
  const npmignoreContent = fs.readFileSync('.npmignore', 'utf8');
  checkError(npmignoreContent.includes('src/'), '.npmignore excludes source files');
  checkError(npmignoreContent.includes('*.test.'), '.npmignore excludes test files');
  checkError(npmignoreContent.includes('node_modules/'), '.npmignore excludes node_modules');
}

// Check package size
console.log(chalk.blue('\n📏 Checking package size...'));
try {
  const { execSync } = require('child_process');
  const packOutput = execSync('npm pack --dry-run', { encoding: 'utf8' });
  const sizeMatch = packOutput.match(/package size:\s*(\d+(?:\.\d+)?)\s*(\w+)/);
  if (sizeMatch) {
    const size = parseFloat(sizeMatch[1]);
    const unit = sizeMatch[2];
    const sizeInMB = unit === 'kB' ? size / 1000 : size;
    checkWarning(sizeInMB < 5, `Package size is reasonable (${size} ${unit})`);
  }
} catch (error) {
  console.log(chalk.yellow('⚠️  Could not check package size'));
}

// Final summary
console.log(chalk.blue('\n📊 Summary:'));
if (hasErrors) {
  console.log(chalk.red('❌ Pre-publish check FAILED'));
  console.log(chalk.red('Please fix the errors above before publishing.'));
  process.exit(1);
} else {
  console.log(chalk.green('✅ Pre-publish check PASSED'));
  console.log(chalk.green('Package is ready for publishing!'));

  console.log(chalk.blue('\n🚀 Next steps:'));
  console.log('1. Run: pnpm build');
  console.log('2. Run: pnpm test');
  console.log('3. Run: ./scripts/publish.sh');
  console.log('4. Or run: npm publish --access public');
}
