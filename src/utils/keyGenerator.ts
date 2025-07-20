import path from 'path';
import { ExtractedText, I18nConfig } from '../types';

// Global counter for key generation (like localized-tool's zh_index)
let globalKeyIndex = 100;

/**
 * Generate a key for extracted text - matches localized-tool behavior exactly
 */
export function generateKey(extracted: ExtractedText, config: I18nConfig): string {
  const filename = path.basename(extracted.filePath, path.extname(extracted.filePath));
  const relativePath = path.relative(config.sourceDir, extracted.filePath);

  // Get directory path parts (excluding the filename)
  const dirs = path.dirname(relativePath).split(path.sep).filter(dir => dir !== '.');

  // Filter out ignored patterns (like 'src', 'components') - matches OUT_NOT_NEED_KEYS
  const filteredDirs = dirs.filter(dir =>
    !config.ignoreKeyPatterns.some(pattern => dir === pattern)
  );

  // Add filename (like localized-tool does)
  filteredDirs.push(filename);

  // Generate key prefix by joining with underscore (like localized-tool's key_specials)
  const keySpecials = filteredDirs.join('_');

  // Add incrementing index (like localized-tool's zh_index)
  globalKeyIndex += 1;

  return keySpecials + globalKeyIndex;
}

/**
 * Reset the global key index (useful for testing)
 */
export function resetKeyIndex(startIndex: number = 100): void {
  globalKeyIndex = startIndex;
}

/**
 * Generate key from text content (for simple cases)
 */
export function generateKeyFromText(text: string, prefix = ''): string {
  const cleanText = text
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase()
    .substring(0, 30);

  return prefix ? `${prefix}_${cleanText}` : cleanText;
}

/**
 * Validate key format
 */
export function validateKey(key: string): boolean {
  // Key should only contain letters, numbers, underscores, and dots
  return /^[a-zA-Z0-9_.]+$/.test(key);
}

/**
 * Normalize key (ensure it follows conventions)
 */
export function normalizeKey(key: string): string {
  return key
    .replace(/[^a-zA-Z0-9_.]/g, '_') // Replace invalid characters
    .replace(/_+/g, '_') // Remove duplicate underscores
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
}
