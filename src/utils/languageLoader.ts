import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'fast-glob';
import { I18nConfig, LanguageFile } from '../types';

/**
 * Load all language files from the locale directory
 */
export async function loadLanguageFiles(config: I18nConfig): Promise<Record<string, LanguageFile>> {
  const languageFiles: Record<string, LanguageFile> = {};

  try {
    // Find all language files
    const patterns = ['**/*.json', '**/*.js', '**/*.yaml', '**/*.yml'];
    const files = await glob(patterns, {
      cwd: config.localeDir,
      absolute: true
    });

    for (const filePath of files) {
      try {
        const languageFile = await loadLanguageFile(filePath);
        if (languageFile) {
          languageFiles[languageFile.locale] = languageFile;
        }
      } catch (error) {
        console.warn(`Failed to load language file ${filePath}:`, error);
      }
    }
  } catch (error) {
    console.warn(`Failed to scan locale directory ${config.localeDir}:`, error);
  }

  return languageFiles;
}

/**
 * Load a single language file
 */
export async function loadLanguageFile(filePath: string): Promise<LanguageFile | null> {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath, ext);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    let translations: Record<string, string> = {};
    let format: 'js' | 'json' | 'yaml' | 'properties' = 'json';

    switch (ext) {
      case '.json':
        translations = JSON.parse(content);
        format = 'json';
        break;

      case '.js':
        // Handle ES modules and CommonJS
        translations = await loadJSLanguageFile(filePath, content);
        format = 'js';
        break;

      case '.yaml':
      case '.yml':
        // Would need yaml parser
        console.warn(`YAML files not yet supported: ${filePath}`);
        return null;

      default:
        console.warn(`Unsupported file format: ${filePath}`);
        return null;
    }

    // Flatten nested objects
    const flatTranslations = flattenObject(translations);

    return {
      filePath,
      locale: basename,
      translations: flatTranslations,
      format
    };
  } catch (error) {
    console.warn(`Failed to parse language file ${filePath}:`, error);
    return null;
  }
}

/**
 * Load JavaScript language file - supports localized-tool format
 */
async function loadJSLanguageFile(filePath: string, content: string): Promise<Record<string, string>> {
  try {
    // Clear require cache first
    delete require.cache[require.resolve(filePath)];

    // Directly require the file
    const module = require(filePath);

    // Support different export formats:
    // 1. export const message = {...} (ES6)
    // 2. module.exports = { message: {...} } (CommonJS)
    // 3. module.exports.message = {...} (CommonJS)
    // 4. export default { message: {...} } (ES6 default)
    let translations = module.default?.message || module.message || module.default || module;

    if (!translations || typeof translations !== 'object') {
      console.warn(`No valid translations found in ${filePath}`);
      return {};
    }

    return translations;
  } catch (error) {
    console.warn(`Failed to load JS language file ${filePath}:`, error);
    return {};
  }
}

/**
 * Flatten nested object to dot notation
 */
function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const flattened: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = String(value);
    }
  }

  return flattened;
}

/**
 * Save language file
 */
export async function saveLanguageFile(
  languageFile: LanguageFile,
  outputPath?: string
): Promise<void> {
  const filePath = outputPath || languageFile.filePath;
  const ext = path.extname(filePath).toLowerCase();

  // Unflatten the translations if needed
  const unflattened = unflattenObject(languageFile.translations);

  let content: string;

  switch (ext) {
    case '.json':
      content = JSON.stringify(unflattened, null, 2);
      break;

    case '.js':
      content = `/* eslint-disable */\nexport const message = ${JSON.stringify(unflattened, null, 2)};\n`;
      break;

    default:
      throw new Error(`Unsupported output format: ${ext}`);
  }

  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Unflatten dot notation object
 */
function unflattenObject(flattened: Record<string, string>): any {
  const result: any = {};

  for (const [key, value] of Object.entries(flattened)) {
    const keys = key.split('.');
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (k && !(k in current)) {
        current[k] = {};
      }
      if (k) {
        current = current[k];
      }
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      current[lastKey] = value;
    }
  }

  return result;
}
