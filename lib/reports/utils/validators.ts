import { ReportFormat, ReportTemplate, ReportOptions } from '../types';

/**
 * Utilitários de validação para o sistema de relatórios
 */
export class ReportValidators {
  
  /**
   * Valida se o formato é suportado pelo sistema
   */
  static isValidFormat(format: string): format is ReportFormat {
    return ['csv', 'pdf', 'png'].includes(format);
  }

  /**
   * Valida se o template é suportado pelo sistema
   */
  static isValidTemplate(template: string): template is ReportTemplate {
    return ['complete', 'members', 'executive', 'analytics', 'trends'].includes(template);
  }

  /**
   * Valida se as opções de relatório estão bem formatadas
   */
  static validateReportOptions(options: any): options is ReportOptions {
    if (!options || typeof options !== 'object') {
      return false;
    }

    // Verificar propriedades obrigatórias
    const requiredProps = ['includeGeneralStats'];
    for (const prop of requiredProps) {
      if (!(prop in options)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Valida dados de estatísticas básicas
   */
  static validateStatsData(stats: any): boolean {
    if (!stats || typeof stats !== 'object') {
      return false;
    }

    const requiredStats = ['total_messages', 'active_members', 'days_analyzed'];
    return requiredStats.every(stat => 
      stat in stats && typeof stats[stat] === 'number'
    );
  }

  /**
   * Sanitiza nome de arquivo para download
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
} 
 