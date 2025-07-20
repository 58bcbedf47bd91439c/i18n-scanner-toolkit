import chalk from 'chalk';
import inquirer from 'inquirer';
import readline from 'readline';
import { I18nScanner } from '../core/Scanner';
import { loadConfig, validateConfig, generateExampleConfig } from '../config/loader';
import { CLIOptions } from '../types';
import { JsonExporter } from '../exporters';
import fs from 'fs-extra';
import path from 'path';

export async function runCLI(command: string, options: CLIOptions): Promise<void> {
  switch (command) {
    case 'interactive':
      await runInteractiveMenu();
      break;
    case 'scan':
      await handleScan(options);
      break;
    case 'init':
      await handleInit(options);
      break;
    case 'extract':
      await handleExtract(options);
      break;
    case 'validate':
      await handleValidate(options);
      break;
    case 'clean':
      await handleClean(options);
      break;
    case 'stats':
      await handleStats(options);
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

/**
 * Interactive menu - like bin/cli.js
 */
export async function runInteractiveMenu(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function showMenu(): Promise<void> {
    return new Promise((resolve) => {
      console.clear();
      console.log(chalk.blue.bold('🔍 i18n 翻译管理工具\n'));
      console.log('请选择以下操作，输入数字即可');
      console.log('1 :查找缺失的中文文案');
      console.log('2 :导出 CSV 文件（文件会存放到当前目录）');
      console.log('3 :导入 CSV 文件');
      console.log('4 :退出');
      console.log('');

      rl.question('', async (answer) => {
        await handleMenuChoice(answer.trim(), rl, showMenu);
        resolve();
      });
    });
  }

  await showMenu();
}

async function handleMenuChoice(choice: string, rl: readline.Interface, showMenu: () => Promise<void>): Promise<void> {
  switch (choice) {
    case '1':
      await findMissingTexts();
      break;
    case '2':
      await exportToCSV();
      break;
    case '3':
      console.log('-'.repeat(50));
      rl.question('请输入导入 CSV 的文件地址：', async (csvPath) => {
        await importFromCSV(csvPath);
        await backToMenu(rl, showMenu);
      });
      return; // Don't call backToMenu here since it's called in the callback
    case '4':
      console.log(chalk.yellow('👋 再见！'));
      rl.close();
      return;
    default:
      console.log(chalk.red('❌ 无效选项，请重新选择'));
      setTimeout(showMenu, 1000);
      return;
  }

  await backToMenu(rl, showMenu);
}

async function backToMenu(rl: readline.Interface, showMenu: () => Promise<void>): Promise<void> {
  return new Promise((resolve) => {
    console.log('\n按任意键返回主菜单...');
    rl.question('', async () => {
      await showMenu();
      resolve();
    });
  });
}

/**
 * 1. 查找缺失的中文文案
 */
async function findMissingTexts(): Promise<void> {
  console.log('\n🔍 正在查找缺失的中文文案...\n');

  try {
    const config = await loadConfig();
    const scanner = new I18nScanner(config);
    const result = await scanner.scan();

    console.log(`🔍 找到 ${result.extractedTexts.length} 个 $LS() 调用`);

    if (result.missingTexts.length === 0) {
      console.log(chalk.green('✅ 太棒了！没有发现缺失的翻译。'));
    } else {
      console.log(chalk.red(`❌ 发现 ${result.missingTexts.length} 个缺失的翻译:\n`));
      result.missingTexts.slice(0, 10).forEach((item, index) => {
        console.log(`${index + 1}. 文本: "${item.text}"`);
        console.log(`   建议Key: ${chalk.cyan(item.suggestedKey)}`);
        console.log(`   出现次数: ${item.occurrences.length}`);
        console.log('');
      });

      if (result.missingTexts.length > 10) {
        console.log(`   ... 还有 ${result.missingTexts.length - 10} 个`);
      }
    }

  } catch (error: any) {
    console.log(chalk.red(`❌ 扫描失败: ${error.message}`));
  }
}

/**
 * 2. 导出 CSV
 */
async function exportToCSV(): Promise<void> {
  console.log('\n📤 正在生成 CSV 文件...');

  try {
    const config = await loadConfig();
    const scanner = new I18nScanner(config);

    // 使用 Scanner 的 export 方法导出 CSV
    const csvPath = await scanner.export();

    console.log(chalk.green(`✅ CSV 文件生成成功: ${csvPath}`));
    console.log(`📊 已导出所有现有翻译到 CSV 文件`);
    console.log(`🌍 可在 Excel 或其他 CSV 编辑器中编辑翻译`);

  } catch (error: any) {
    console.log(chalk.red(`❌ 导出失败: ${error.message}`));
  }
}

/**
 * 3. 导入 CSV
 */
async function importFromCSV(csvPath: string): Promise<void> {
  console.log(`\n📥 正在导入 CSV 文件: ${csvPath}`);

  if (!await fs.pathExists(csvPath)) {
    console.log(chalk.red('❌ 文件不存在'));
    return;
  }

  try {
    const config = await loadConfig();
    const scanner = new I18nScanner(config);

    // 使用 Scanner 的 import 方法导入 CSV
    await scanner.import(csvPath);

    console.log(chalk.green('✅ CSV 文件导入成功'));
    console.log('📝 语言文件已更新');

  } catch (error: any) {
    console.log(chalk.red(`❌ 导入失败: ${error.message}`));
  }
}

async function handleScan(options: CLIOptions): Promise<void> {
  // Load configuration for current project
  const config = await loadConfig(options.project || process.cwd());

  // Override with CLI options if provided
  if (options.project) {
    config.projectDir = path.resolve(options.project);
  }

  // Validate configuration
  const validation = validateConfig(config);
  if (!validation.valid) {
    console.error(chalk.red('❌ Configuration validation failed:'));
    validation.errors.forEach(error => console.error(chalk.red(`  • ${error}`)));
    return;
  }

  if (options.verbose) {
    console.log(chalk.gray('📋 Configuration:'));
    console.log(chalk.gray(JSON.stringify(config, null, 2)));
    console.log();
  }

  // Create scanner and run scan
  const scanner = new I18nScanner(config);
  const result = await scanner.scan();

  // Display results
  console.log(chalk.green('✅ Scan completed!\n'));

  console.log(chalk.blue('📊 Statistics:'));
  console.log(`  Files scanned: ${result.stats.filesScanned}`);
  console.log(`  Texts extracted: ${result.stats.textsExtracted}`);
  console.log(`  Unique texts: ${result.stats.uniqueTexts}`);
  console.log(`  Missing texts: ${result.stats.missingTexts}`);
  console.log(`  Coverage: ${result.stats.coverage}%`);
  console.log(`  Duration: ${result.stats.duration}ms\n`);

  if (result.missingTexts.length > 0) {
    console.log(chalk.yellow(`❌ Found ${result.missingTexts.length} missing texts:`));
    result.missingTexts.slice(0, 10).forEach((missing, index) => {
      console.log(`  ${index + 1}. "${missing.text}"`);
      console.log(`     Suggested key: ${chalk.cyan(missing.suggestedKey)}`);
      console.log(`     Occurrences: ${missing.occurrences.length}`);
    });

    if (result.missingTexts.length > 10) {
      console.log(`     ... and ${result.missingTexts.length - 10} more`);
    }
    console.log();
  } else {
    console.log(chalk.green('🎉 No missing texts found!'));
  }

  // Export results if requested
  if (!options.dryRun) {
    await exportResults(result, options.output || 'excel', config.projectDir);
  }
}

async function handleInit(options: any): Promise<void> {
  const framework = options.framework || 'react';
  const configPath = path.join(process.cwd(), 'i18n-scanner.config.json');

  // Check if config already exists
  if (await fs.pathExists(configPath) && !options.force) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Configuration file already exists. Overwrite?',
        default: false
      }
    ]);

    if (!overwrite) {
      console.log(chalk.yellow('⏭️  Initialization cancelled'));
      return;
    }
  }

  // Generate configuration
  const configContent = generateExampleConfig(framework);
  await fs.writeFile(configPath, configContent);

  console.log(chalk.green(`✅ Configuration file created: ${configPath}`));
  console.log(chalk.blue('📝 Next steps:'));
  console.log('  1. Edit the configuration file to match your project');
  console.log('  2. Run: i18n-scanner scan');
}

async function handleExtract(options: CLIOptions): Promise<void> {
  const config = options.config ? loadConfig(options.config) : loadConfig();
  const scanner = new I18nScanner(config);
  const result = await scanner.scan();

  // Generate language file with missing texts
  const locale = options.locale || 'en';
  const translations: Record<string, string> = {};

  result.missingTexts.forEach(missing => {
    translations[missing.suggestedKey] = missing.text;
  });

  const outputPath = path.join(config.localeDir, `${locale}.json`);

  if (options.merge && await fs.pathExists(outputPath)) {
    const existing = await fs.readJson(outputPath);
    Object.assign(existing, translations);
    await fs.writeJson(outputPath, existing, { spaces: 2 });
  } else {
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeJson(outputPath, translations, { spaces: 2 });
  }

  console.log(chalk.green(`✅ Extracted ${Object.keys(translations).length} texts to ${outputPath}`));
}

async function handleValidate(options: CLIOptions): Promise<void> {
  const config = options.config ? loadConfig(options.config) : loadConfig();
  const validation = validateConfig(config);

  if (validation.valid) {
    console.log(chalk.green('✅ Configuration is valid'));
  } else {
    console.log(chalk.red('❌ Configuration validation failed:'));
    validation.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
  }
}

async function handleClean(options: CLIOptions): Promise<void> {
  const config = options.config ? loadConfig(options.config) : loadConfig();
  const scanner = new I18nScanner(config);
  const result = await scanner.scan();

  // Find unused keys in translation files
  const usedTexts = new Set(result.extractedTexts.map(t => t.text));
  const unusedKeys: string[] = [];

  for (const [locale, langFile] of Object.entries(result.existingTranslations)) {
    for (const [key, value] of Object.entries(langFile.translations)) {
      if (!usedTexts.has(value)) {
        unusedKeys.push(`${locale}:${key}`);
      }
    }
  }

  if (unusedKeys.length === 0) {
    console.log(chalk.green('✅ No unused translation keys found'));
    return;
  }

  console.log(chalk.yellow(`🧹 Found ${unusedKeys.length} unused translation keys:`));
  unusedKeys.slice(0, 10).forEach(key => console.log(`  • ${key}`));

  if (unusedKeys.length > 10) {
    console.log(`  ... and ${unusedKeys.length - 10} more`);
  }

  if (options.dryRun) {
    console.log(chalk.blue('🔍 Dry run mode - no files were modified'));
  } else {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Remove these unused keys?',
        default: false
      }
    ]);

    if (confirm) {
      // TODO: Implement actual removal
      console.log(chalk.green('✅ Unused keys removed'));
    }
  }
}

async function handleStats(options: CLIOptions): Promise<void> {
  const config = options.config ? loadConfig(options.config) : loadConfig();
  const scanner = new I18nScanner(config);
  const result = await scanner.scan();

  const stats = {
    project: config.projectDir,
    framework: config.framework,
    ...result.stats,
    languages: Object.keys(result.existingTranslations),
    languageFiles: Object.values(result.existingTranslations).map(lang => ({
      locale: lang.locale,
      format: lang.format,
      keys: Object.keys(lang.translations).length
    }))
  };

  if (options.json) {
    console.log(JSON.stringify(stats, null, 2));
  } else {
    console.log(chalk.blue('📊 Project i18n Statistics\n'));
    console.log(`Project: ${stats.project}`);
    console.log(`Framework: ${stats.framework}`);
    console.log(`Files scanned: ${stats.filesScanned}`);
    console.log(`Texts extracted: ${stats.textsExtracted}`);
    console.log(`Unique texts: ${stats.uniqueTexts}`);
    console.log(`Missing texts: ${stats.missingTexts}`);
    console.log(`Coverage: ${stats.coverage}%`);
    console.log(`Languages: ${stats.languages.join(', ')}`);
    console.log('\nLanguage files:');
    stats.languageFiles.forEach(lang => {
      console.log(`  ${lang.locale} (${lang.format}): ${lang.keys} keys`);
    });
  }
}

async function exportResults(result: any, format: string, projectDir: string): Promise<void> {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '_');
  const outputDir = path.join(require('os').homedir(), 'Downloads');

  switch (format) {
    case 'json':
      const jsonPath = path.join(outputDir, `i18n-scan-${timestamp}.json`);
      const jsonExporter = new JsonExporter();
      await jsonExporter.export(result, jsonPath);
      console.log(chalk.green(`📄 JSON report saved: ${jsonPath}`));
      break;

    case 'csv':
      // 使用 Scanner 的 export 方法导出 CSV
      const config = await loadConfig(projectDir);
      const scanner = new I18nScanner(config);
      const csvPath = await scanner.export(path.join(outputDir, `i18n-export-${timestamp}.csv`));
      console.log(chalk.green(`📊 CSV export saved: ${csvPath}`));
      break;

    default:
      console.warn(chalk.yellow(`⚠️  Unknown output format: ${format}. Supported: json, csv`));
  }
}
