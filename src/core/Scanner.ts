import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'fast-glob';
import { I18nConfig, ScanResult, ExtractedText, LanguageFile, MissingText, ScanStats } from '../types';
import { loadLanguageFiles } from '../utils/languageLoader';
import { extractTextsFromFile } from '../utils/textExtractor';
import { generateKey } from '../utils/keyGenerator';

export class I18nScanner {
  private config: I18nConfig;

  constructor(config?: Partial<I18nConfig>) {
    // If no config provided, we'll load it in the scan method
    this.config = config as I18nConfig;
  }

  /**
   * Create scanner with auto-detected configuration
   */
  static async create(config?: Partial<I18nConfig>): Promise<I18nScanner> {
    const { loadConfig } = await import('../config/loader');
    const fullConfig = await loadConfig();

    const finalConfig = config ? { ...fullConfig, ...config } : fullConfig;
    return new I18nScanner(finalConfig);
  }

  /**
   * Scan project for i18n texts
   */
  async scan(): Promise<ScanResult> {
    // Auto-load config if not provided
    if (!this.config) {
      const { loadConfig } = await import('../config/loader');
      this.config = await loadConfig();
    }

    const startTime = Date.now();

    console.log('🔍 Starting i18n scan...');
    console.log(`📁 Project: ${this.config.projectDir}`);
    console.log(`🎯 Framework: ${this.config.framework || 'auto-detected'}`);

    // 1. Find all source files
    const sourceFiles = await this.findSourceFiles();
    console.log(`📁 Found ${sourceFiles.length} source files`);

    // 2. Extract texts from source files
    const extractedTexts = await this.extractTexts(sourceFiles);
    console.log(`📝 Extracted ${extractedTexts.length} texts`);

    // 3. Load existing translations
    const existingTranslations = await this.loadExistingTranslations();
    console.log(`🌍 Loaded ${Object.keys(existingTranslations).length} language files`);

    // 4. Find missing texts
    const missingTexts = this.findMissingTexts(extractedTexts, existingTranslations);
    console.log(`❌ Found ${missingTexts.length} missing texts`);

    // 5. Calculate statistics
    const stats = this.calculateStats(extractedTexts, missingTexts, Date.now() - startTime, sourceFiles.length);

    return {
      extractedTexts,
      existingTranslations,
      missingTexts,
      stats
    };
  }

  /**
   * Find all source files to scan
   */
  private async findSourceFiles(): Promise<string[]> {
    const patterns = this.config.extensions.map(ext =>
      `${this.config.sourceDir}/**/*.${ext}`
    );

    const files = await glob(patterns, {
      cwd: this.config.projectDir,
      ignore: this.config.ignoreDirs.map(dir => `**/${dir}/**`),
      absolute: true
    });

    return files;
  }

  /**
   * Extract texts from source files
   */
  private async extractTexts(sourceFiles: string[]): Promise<ExtractedText[]> {
    const allTexts: ExtractedText[] = [];

    for (const filePath of sourceFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');

        // Skip files with ignore marker
        if (content.includes('i18n-ignore-file')) {
          console.log(`⏭️  Skipping ignored file: ${path.relative(this.config.projectDir, filePath)}`);
          continue;
        }

        const texts = await extractTextsFromFile(content, filePath, this.config);
        allTexts.push(...texts);
      } catch (error) {
        console.warn(`⚠️  Failed to read file ${filePath}:`, error);
      }
    }

    return allTexts;
  }

  /**
   * Load existing translation files
   */
  private async loadExistingTranslations(): Promise<Record<string, LanguageFile>> {
    return await loadLanguageFiles(this.config);
  }

  /**
   * Find missing texts by comparing extracted texts with existing translations
   */
  private findMissingTexts(
    extractedTexts: ExtractedText[],
    existingTranslations: Record<string, LanguageFile>
  ): MissingText[] {
    // Try to find default locale file by name (zh_hans, en, etc.)
    const defaultLocaleName = path.basename(this.config.defaultLocale, path.extname(this.config.defaultLocale));
    const defaultLocaleFile = existingTranslations[defaultLocaleName] ||
                             existingTranslations['zh_hans'] ||
                             existingTranslations['zh'] ||
                             Object.values(existingTranslations)[0]; // fallback to first available

    if (!defaultLocaleFile) {
      console.warn(`⚠️  No language files found in ${this.config.localeDir}`);
      // Return all texts as missing
      const missingTextsMap = new Map<string, MissingText>();

      for (const extracted of extractedTexts) {
        const existing = missingTextsMap.get(extracted.text);

        if (existing) {
          existing.occurrences.push({
            filePath: extracted.filePath,
            line: extracted.line,
            column: extracted.column,
            context: extracted.context || ''
          });
        } else {
          missingTextsMap.set(extracted.text, {
            text: extracted.text,
            suggestedKey: this.generateSuggestedKey(extracted),
            occurrences: [{
              filePath: extracted.filePath,
              line: extracted.line,
              column: extracted.column,
              context: extracted.context || ''
            }]
          });
        }
      }

      return Array.from(missingTextsMap.values());
    }

    const existingTexts = new Set(Object.values(defaultLocaleFile.translations));
    const missingTextsMap = new Map<string, MissingText>();

    for (const extracted of extractedTexts) {
      if (!existingTexts.has(extracted.text)) {
        const existing = missingTextsMap.get(extracted.text);

        if (existing) {
          existing.occurrences.push({
            filePath: extracted.filePath,
            line: extracted.line,
            column: extracted.column,
            context: extracted.context || ''
          });
        } else {
          missingTextsMap.set(extracted.text, {
            text: extracted.text,
            suggestedKey: this.generateSuggestedKey(extracted),
            occurrences: [{
              filePath: extracted.filePath,
              line: extracted.line,
              column: extracted.column,
              context: extracted.context || ''
            }]
          });
        }
      }
    }

    return Array.from(missingTextsMap.values());
  }

  /**
   * Generate suggested key for missing text
   */
  private generateSuggestedKey(extracted: ExtractedText): string {
    return generateKey(extracted, this.config);
  }

  /**
   * 扫描所有文件，返回缺失翻译的 JSON 格式
   * Scan all files and return missing translations in JSON format
   */
  public async scanAll(): Promise<Record<string, string>> {
    console.log('🔍 Starting i18n scan...');

    const result = await this.scan();

    console.log(`📁 Found ${result.extractedTexts.length} texts`);
    console.log(`❌ Found ${result.missingTexts.length} missing texts`);

    // 生成缺失翻译的 JSON
    const missingJson: Record<string, string> = {};
    result.missingTexts.forEach(missing => {
      missingJson[missing.suggestedKey] = missing.text;
    });

    return missingJson;
  }

  /**
   * 导出现有语言文件到 CSV 文件（类似 localized-tool 的 Excel 格式）
   * Export existing language files to CSV file (similar to localized-tool's Excel format)
   * 只导出现有语言文件中的 key，不扫描源代码
   */
  public async export(filePath?: string): Promise<string> {
    console.log('🔍 Loading existing language files...');

    // 只加载现有语言文件，不扫描源代码
    const languageFiles = await loadLanguageFiles(this.config);

    // 生成类似 localized-tool 的时间戳格式: lang_bulid_20180427_105118.csv
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
                     (now.getMonth() + 1).toString().padStart(2, '0') +
                     now.getDate().toString().padStart(2, '0') + '_' +
                     now.getHours().toString().padStart(2, '0') +
                     now.getMinutes().toString().padStart(2, '0') +
                     now.getSeconds().toString().padStart(2, '0');

    const outputPath = filePath || `./lang_bulid_${timestamp}.csv`;

    // 获取所有语言
    const languages = Object.keys(languageFiles);
    console.log(`📊 Found languages: ${languages.join(', ')}`);

    // 收集所有 key（只从现有语言文件中）
    const allKeys = new Set<string>();

    // 添加所有语言文件中的 keys
    Object.values(languageFiles).forEach(langFile => {
      Object.keys(langFile.translations).forEach(key => allKeys.add(key));
    });

    const sortedKeys = Array.from(allKeys).sort();
    console.log(`🔑 Found ${sortedKeys.length} unique keys`);

    // 生成 CSV 内容（类似 localized-tool 的格式）
    const csvLines: string[] = [];

    // 表头：key + 所有语言
    const header = ['key', ...languages];
    csvLines.push(header.join(','));

    // 数据行
    sortedKeys.forEach(key => {
      const row = [key];

      // 为每种语言添加翻译
      languages.forEach(lang => {
        const langFile = languageFiles[lang];
        let translation = langFile?.translations[key] || '';

        // 如果没有翻译，保持空白
        // 不使用原文填充，让用户自己填写翻译

        // 转义 CSV 中的引号和逗号
        if (translation && (translation.includes(',') || translation.includes('"') || translation.includes('\n'))) {
          translation = `"${translation.replace(/"/g, '""')}"`;
        }

        row.push(translation);
      });

      csvLines.push(row.join(','));
    });

    const csvContent = csvLines.join('\n');

    // 写入文件
    const fs = await import('fs-extra');
    await fs.default.writeFile(outputPath, csvContent, 'utf8');

    console.log(`💾 Exported ${sortedKeys.length} keys to: ${outputPath}`);
    console.log(`📊 Languages: ${languages.join(', ')}`);
    return outputPath;
  }

  /**
   * 从 CSV 文件导入翻译
   * Import translations from CSV file
   */
  public async import(filePath: string): Promise<void> {
    const fs = await import('fs-extra');

    if (!await fs.default.pathExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const csvContent = await fs.default.readFile(filePath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }

    // 解析 CSV (简单实现，假设格式为: key,text,file,line)
    const translations: Record<string, string> = {};

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line) {
        const match = line.match(/^([^,]+),"([^"]*(?:""[^"]*)*)"(?:,.*)?$/);

        if (match && match[1] && match[2]) {
          const key = match[1];
          const text = match[2].replace(/""/g, '"'); // 处理转义的引号
          translations[key] = text;
        }
      }
    }

    console.log(`📥 Imported ${Object.keys(translations).length} translations from: ${filePath}`);

    // 更新语言文件
    await this.updateLanguageFiles(translations);
  }

  /**
   * 更新语言文件
   * Update language files with new translations
   */
  private async updateLanguageFiles(translations: Record<string, string>): Promise<void> {
    const fs = await import('fs-extra');

    // 获取现有语言文件
    const result = await this.scan();
    const languageFiles = result.existingTranslations;

    // 更新每个语言文件
    for (const [locale, langFile] of Object.entries(languageFiles)) {
      const updatedTranslations = { ...langFile.translations };

      // 添加新的翻译（这里添加的是中文原文，实际使用时可能需要翻译）
      Object.entries(translations).forEach(([key, text]) => {
        if (!updatedTranslations[key]) {
          updatedTranslations[key] = text; // 默认使用原文，用户可以后续修改
        }
      });

      // 写回文件
      const outputPath = langFile.filePath;
      let content = '';

      if (langFile.format === 'json') {
        content = JSON.stringify(updatedTranslations, null, 2);
      } else {
        // JS 格式
        content = `export default {\n  message: ${JSON.stringify(updatedTranslations, null, 2)}\n};\n`;
      }

      await fs.default.writeFile(outputPath, content, 'utf8');
      console.log(`✅ Updated ${locale} language file: ${outputPath}`);
    }
  }

  /**
   * Calculate scan statistics
   */
  private calculateStats(
    extractedTexts: ExtractedText[],
    missingTexts: MissingText[],
    duration: number,
    filesScanned: number
  ): ScanStats {
    const uniqueTexts = new Set(extractedTexts.map(t => t.text)).size;
    const coverage = uniqueTexts > 0 ? ((uniqueTexts - missingTexts.length) / uniqueTexts) * 100 : 0;

    return {
      filesScanned,
      textsExtracted: extractedTexts.length,
      uniqueTexts,
      missingTexts: missingTexts.length,
      coverage: Math.round(coverage * 100) / 100,
      duration
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<I18nConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): I18nConfig {
    return { ...this.config };
  }
}
