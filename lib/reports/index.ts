// Sistema Modular de Relatórios - Exportações Principais
import { CSVGenerator } from './generators/csv-generator';
import { PDFGenerator } from './generators/pdf-generator';
import { PNGGenerator } from './generators/png-generator';
import { getTemplateById } from './templates';
import { ReportOptions, ReportData, ReportFormat } from './types';
import { ReportValidators } from './utils/validators';

export * from './types';
export * from './templates';
export * from './generators';
export * from './utils/insights-calculator';

// Classe principal do sistema
export class ReportSystem {
  static async generateReport(
    stats: any,
    options: any,
    format: ReportFormat,
    groupName?: string,
    startDate?: string,
    endDate?: string
  ): Promise<Blob> {
    // Validar entradas
    if (!ReportValidators.isValidFormat(format)) {
      throw new Error(`Formato não suportado: ${format}`);
    }

    if (!ReportValidators.validateStatsData(stats)) {
      throw new Error('Dados de estatísticas inválidos');
    }

    if (!ReportValidators.validateReportOptions(options)) {
      throw new Error('Opções de relatório inválidas');
    }

    switch (format) {
      case 'csv':
        return await CSVGenerator.generate(stats, options);
      case 'pdf':
        return await PDFGenerator.generate(stats, options, groupName, startDate, endDate);
      case 'png':
        return await PNGGenerator.generate(stats, options, groupName, startDate, endDate);
      default:
        throw new Error(`Formato não implementado: ${format}`);
    }
  }

  static generateFilename(
    template: string,
    groupName: string,
    format: string,
    dateStr: string
  ): string {
    const sanitizedGroupName = ReportValidators.sanitizeFilename(groupName);
    const sanitizedTemplate = ReportValidators.sanitizeFilename(template);
    
    return `relatorio_${sanitizedTemplate}_${sanitizedGroupName}_${dateStr}.${format}`;
  }

  static async downloadReport(blob: Blob, fileName: string, format: string): Promise<void> {
    const sanitizedFileName = ReportValidators.sanitizeFilename(fileName);
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = sanitizedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
} 