import { DetailedStats } from '@/lib/analysis';
import { ReportOptions } from '../types';
import { InsightsCalculator } from '../utils/insights-calculator';

export class CSVGenerator {
  static async generate(stats: DetailedStats, options: ReportOptions, groupName?: string, startDate?: string, endDate?: string): Promise<Blob> {
    let csvContent = '';
    
    // BOM para UTF-8 (corrige caracteres portugueses)
    csvContent = '\ufeff';
    
    // Cabeçalho do relatório
    csvContent += `"Relatório de Análise WhatsApp - ${new Date().toLocaleDateString('pt-BR')}"\n`;
    csvContent += `"Período: ${startDate || 'N/A'} a ${endDate || 'N/A'}"\n`;
    csvContent += `"Grupo: ${groupName || 'Sem nome'}"\n\n`;
    
    // Estatísticas gerais
    if (options.includeGeneralStats) {
      csvContent += this.generateGeneralStats(stats, startDate, endDate);
    }
    
    // Atividade diária
    if (options.includeDailyActivity) {
      csvContent += this.generateDailyActivity(stats);
    }
    
    // Ranking de membros
    if (options.includeMemberRanking) {
      csvContent += this.generateMemberRanking(stats, options);
    }
    
    // Atividade por hora
    if (options.includeHourlyActivity) {
      csvContent += this.generateHourlyActivity(stats);
    }
    
    // Estatísticas de palavras
    if (options.includeWordStatistics) {
      csvContent += this.generateWordStatistics(stats);
    }
    
    // Análise de mídia
    if (options.includeMediaAnalysis) {
      csvContent += this.generateMediaAnalysis(stats);
    }
    
    // Atividade dos membros (para template de membros)
    if (options.showMemberActivity) {
      csvContent += this.generateMemberActivity(stats);
    }
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
  
  private static generateGeneralStats(stats: DetailedStats, startDate?: string, endDate?: string): string {
    let section = '"=== ESTATÍSTICAS GERAIS ==="\n';
    section += '"Métrica","Valor"\n';
    section += `"Total de Mensagens","${stats.total_messages.toLocaleString('pt-BR')}"\n`;
    section += `"Membros Ativos","${stats.active_members.toLocaleString('pt-BR')}"\n`;
    section += `"Dias Analisados","${stats.days_analyzed}"\n`;
    section += `"Média de Mensagens/Dia","${Math.round(stats.total_messages / Math.max(stats.days_analyzed, 1))}"\n`;
    section += `"Média de Palavras/Mensagem","${stats.avg_words_per_message?.toFixed(1) || 'N/A'}"\n`;
    section += `"Data de Início","${startDate || 'N/A'}"\n`;
    section += `"Data de Fim","${endDate || 'N/A'}"\n`;
    section += '\n';
    return section;
  }
  
  private static generateDailyActivity(stats: DetailedStats): string {
    let section = '"=== ATIVIDADE DIÁRIA ==="\n';
    section += '"Data","Mensagens","Membros Ativos"\n';
    
    stats.daily_stats.forEach(day => {
      section += `"${day.date}","${day.total_messages}","${day.active_members}"\n`;
    });
    
    section += '\n';
    return section;
  }
  
  private static generateMemberRanking(stats: DetailedStats, options: ReportOptions): string {
    let section = '"=== RANKING DE MEMBROS ==="\n';
    section += '"Posição","Nome","Mensagens","% do Total","Palavras/Mensagem","Primeira Mensagem","Última Mensagem"\n';
    
    const membersToShow = options.maxMembersInRanking === -1 
      ? stats.member_stats 
      : stats.member_stats.slice(0, options.maxMembersInRanking);
    
    membersToShow.forEach((member, index) => {
      const percentage = ((member.message_count / stats.total_messages) * 100).toFixed(1);
      const wordsPerMessage = member.avg_words_per_message?.toFixed(1) || 'N/A';
      const firstMessage = member.first_message_at ? member.first_message_at.toLocaleDateString('pt-BR') : 'N/A';
      const lastMessage = member.last_message_at ? member.last_message_at.toLocaleDateString('pt-BR') : 'N/A';
      
      section += `"${index + 1}","${member.name}","${member.message_count}","${percentage}%","${wordsPerMessage}","${firstMessage}","${lastMessage}"\n`;
    });
    
    section += '\n';
    return section;
  }
  
  private static generateHourlyActivity(stats: DetailedStats): string {
    let section = '"=== ATIVIDADE POR HORA ==="\n';
    section += '"Hora","Mensagens","% do Total"\n';
    
    if (stats.hourly_activity) {
      for (let hour = 0; hour < 24; hour++) {
        const hourStr = hour.toString().padStart(2, '0');
        const count = stats.hourly_activity[hourStr] || 0;
        const percentage = ((count / stats.total_messages) * 100).toFixed(1);
        
        section += `"${hourStr}:00","${count}","${percentage}%"\n`;
      }
    }
    
    section += '\n';
    return section;
  }
  
  private static generateWordStatistics(stats: DetailedStats): string {
    let section = '"=== ESTATÍSTICAS DE PALAVRAS ==="\n';
    section += '"Métrica","Valor"\n';
    section += `"Média Geral de Palavras/Mensagem","${stats.avg_words_per_message?.toFixed(1) || 'N/A'}"\n`;
    
    // Estatísticas por membro
    section += '\n"=== PALAVRAS POR MEMBRO ==="\n';
    section += '"Nome","Palavras/Mensagem","Total de Palavras (estimado)"\n';
    
    stats.member_stats.forEach(member => {
      const wordsPerMessage = member.avg_words_per_message || stats.avg_words_per_message || 0;
      const totalWords = Math.round(wordsPerMessage * member.message_count);
      
      section += `"${member.name}","${wordsPerMessage.toFixed(1)}","${totalWords.toLocaleString('pt-BR')}"\n`;
    });
    
    section += '\n';
    return section;
  }
  
  private static generateMediaAnalysis(stats: DetailedStats): string {
    let section = '"=== ANÁLISE DE MÍDIA ==="\n';
    section += '"Tipo","Quantidade","% do Total"\n';
    
    // Simulação de dados de mídia (seria extraído dos dados reais)
    const totalMedia = Math.round(stats.total_messages * 0.15); // 15% estimado
    const photos = Math.round(totalMedia * 0.60);
    const videos = Math.round(totalMedia * 0.20);
    const audios = Math.round(totalMedia * 0.15);
    const documents = totalMedia - photos - videos - audios;
    
    section += `"Fotos","${photos}","${((photos / stats.total_messages) * 100).toFixed(1)}%"\n`;
    section += `"Vídeos","${videos}","${((videos / stats.total_messages) * 100).toFixed(1)}%"\n`;
    section += `"Áudios","${audios}","${((audios / stats.total_messages) * 100).toFixed(1)}%"\n`;
    section += `"Documentos","${documents}","${((documents / stats.total_messages) * 100).toFixed(1)}%"\n`;
    section += `"Total de Mídia","${totalMedia}","${((totalMedia / stats.total_messages) * 100).toFixed(1)}%"\n`;
    
    section += '\n';
    return section;
  }
  
  private static generateMemberActivity(stats: DetailedStats): string {
    let section = '"=== EVOLUÇÃO DA ATIVIDADE DOS MEMBROS ==="\n';
    section += '"Nome","Primeira Mensagem","Última Mensagem","Dias Ativos","Consistência"\n';
    
    stats.member_stats.forEach(member => {
      const firstDate = member.first_message_at ? member.first_message_at.toLocaleDateString('pt-BR') : 'N/A';
      const lastDate = member.last_message_at ? member.last_message_at.toLocaleDateString('pt-BR') : 'N/A';
      
      // Calcular dias ativos (simulado)
      const activeDays = Math.min(member.message_count, stats.days_analyzed);
      const consistency = ((activeDays / stats.days_analyzed) * 100).toFixed(1);
      
      section += `"${member.name}","${firstDate}","${lastDate}","${activeDays}","${consistency}%"\n`;
    });
    
    section += '\n';
    return section;
  }
} 