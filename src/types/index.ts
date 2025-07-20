/**
 * Core types for i18n scanner
 */

export interface I18nConfig {
  /** Project root directory */
  projectDir: string;
  /** Source code directory relative to projectDir */
  sourceDir: string;
  /** Localization files directory relative to projectDir */
  localeDir: string;
  /** File extensions to scan */
  extensions: string[];
  /** Directories to ignore */
  ignoreDirs: string[];
  /** Patterns to ignore when generating keys */
  ignoreKeyPatterns: string[];
  /** Default locale file name */
  defaultLocale: string;
  /** Regex pattern to extract i18n texts */
  extractPattern: string | RegExp;
  /** Framework preset (react, vue, angular, etc.) */
  framework?: 'react' | 'vue' | 'angular' | 'svelte' | 'custom';
  /** Custom extraction functions */
  extractors?: TextExtractor[];
  /** Output configuration */
  output?: OutputConfig;
}

export interface TextExtractor {
  /** Name of the extractor */
  name: string;
  /** File extensions this extractor handles */
  extensions: string[];
  /** Function to extract texts from file content */
  extract: (content: string, filePath: string) => ExtractedText[];
}

export interface ExtractedText {
  /** The extracted text */
  text: string;
  /** Suggested key for this text */
  key: string;
  /** File path where text was found */
  filePath: string;
  /** Line number */
  line: number;
  /** Column number */
  column: number;
  /** Context information */
  context?: string;
}

export interface ScanResult {
  /** All extracted texts */
  extractedTexts: ExtractedText[];
  /** Existing translations */
  existingTranslations: Record<string, LanguageFile>;
  /** Missing translations */
  missingTexts: MissingText[];
  /** Statistics */
  stats: ScanStats;
}

export interface LanguageFile {
  /** File path */
  filePath: string;
  /** Locale code (e.g., 'en', 'zh-CN') */
  locale: string;
  /** Translation key-value pairs */
  translations: Record<string, string>;
  /** File format (js, json, yaml, etc.) */
  format: 'js' | 'json' | 'yaml' | 'properties';
}

export interface MissingText {
  /** The missing text */
  text: string;
  /** Suggested key */
  suggestedKey: string;
  /** Files where this text appears */
  occurrences: TextOccurrence[];
}

export interface TextOccurrence {
  /** File path */
  filePath: string;
  /** Line number */
  line: number;
  /** Column number */
  column: number;
  /** Surrounding context */
  context: string;
}

export interface ScanStats {
  /** Total files scanned */
  filesScanned: number;
  /** Total texts extracted */
  textsExtracted: number;
  /** Unique texts count */
  uniqueTexts: number;
  /** Missing texts count */
  missingTexts: number;
  /** Coverage percentage */
  coverage: number;
  /** Scan duration in ms */
  duration: number;
}

export interface OutputConfig {
  /** Output format */
  format: 'excel' | 'json' | 'csv' | 'yaml';
  /** Output file path */
  filePath?: string;
  /** Include statistics */
  includeStats?: boolean;
  /** Include context information */
  includeContext?: boolean;
}

export interface FrameworkPreset {
  /** Preset name */
  name: string;
  /** Default configuration */
  config: Partial<I18nConfig>;
  /** Text extractors */
  extractors: TextExtractor[];
}

export interface CLIOptions {
  /** Configuration file path */
  config?: string;
  /** Project directory */
  project?: string;
  /** Output format */
  output?: string;
  /** Verbose logging */
  verbose?: boolean;
  /** Dry run mode */
  dryRun?: boolean;
  /** Interactive mode */
  interactive?: boolean;
}
