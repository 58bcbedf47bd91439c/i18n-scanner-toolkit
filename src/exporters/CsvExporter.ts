import { promises as fs } from 'fs';
import { ScanResult } from '../types';

export class CsvExporter {
  async export(result: ScanResult, outputPath: string): Promise<void> {
    const csvContent = this.generateCsvContent(result);
    await fs.writeFile(outputPath, csvContent, 'utf-8');
  }

  private generateCsvContent(result: ScanResult): string {
    const rows: string[] = [];
    
    // Header
    rows.push('Text,Suggested Key,Occurrences,Files,Line Numbers');
    
    // Data rows
    result.missingTexts.forEach(missing => {
      const text = this.escapeCsvField(missing.text);
      const suggestedKey = this.escapeCsvField(missing.suggestedKey);
      const occurrences = missing.occurrences.length.toString();
      const files = this.escapeCsvField(
        missing.occurrences.map(occ => occ.filePath).join('; ')
      );
      const lines = this.escapeCsvField(
        missing.occurrences.map(occ => occ.line.toString()).join('; ')
      );
      
      rows.push(`${text},${suggestedKey},${occurrences},${files},${lines}`);
    });
    
    return rows.join('\n');
  }

  private escapeCsvField(field: string): string {
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}
