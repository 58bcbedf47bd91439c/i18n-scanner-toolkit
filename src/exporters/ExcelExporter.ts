import * as XLSX from 'xlsx';
import { ScanResult } from '../types';

export class ExcelExporter {
  async export(result: ScanResult, outputPath: string): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    // Create missing texts sheet
    this.createMissingTextsSheet(workbook, result);
    
    // Create statistics sheet
    this.createStatsSheet(workbook, result);
    
    // Create existing translations sheet
    this.createTranslationsSheet(workbook, result);
    
    // Write file
    XLSX.writeFile(workbook, outputPath);
  }
  
  private createMissingTextsSheet(workbook: XLSX.WorkBook, result: ScanResult): void {
    const data = [
      ['Text', 'Suggested Key', 'Occurrences', 'Files']
    ];
    
    result.missingTexts.forEach(missing => {
      const files = missing.occurrences.map(occ => 
        `${occ.filePath}:${occ.line}`
      ).join(', ');
      
      data.push([
        missing.text,
        missing.suggestedKey,
        missing.occurrences.length.toString(),
        files
      ]);
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 40 }, // Text
      { wch: 30 }, // Suggested Key
      { wch: 12 }, // Occurrences
      { wch: 50 }  // Files
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Missing Texts');
  }
  
  private createStatsSheet(workbook: XLSX.WorkBook, result: ScanResult): void {
    const data = [
      ['Metric', 'Value'],
      ['Files Scanned', result.stats.filesScanned.toString()],
      ['Texts Extracted', result.stats.textsExtracted.toString()],
      ['Unique Texts', result.stats.uniqueTexts.toString()],
      ['Missing Texts', result.stats.missingTexts.toString()],
      ['Coverage', `${result.stats.coverage}%`],
      ['Duration', `${result.stats.duration}ms`]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Statistics');
  }
  
  private createTranslationsSheet(workbook: XLSX.WorkBook, result: ScanResult): void {
    const locales = Object.keys(result.existingTranslations);
    if (locales.length === 0) return;
    
    // Get all unique keys
    const allKeys = new Set<string>();
    Object.values(result.existingTranslations).forEach(langFile => {
      Object.keys(langFile.translations).forEach(key => allKeys.add(key));
    });
    
    // Create header
    const data = [['Key', ...locales]];
    
    // Add data rows
    Array.from(allKeys).sort().forEach(key => {
      const row = [key];
      locales.forEach(locale => {
        const translation = result.existingTranslations[locale]?.translations[key] || '';
        row.push(translation);
      });
      data.push(row);
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 }, // Key
      ...locales.map(() => ({ wch: 25 })) // Translations
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Translations');
  }
}
