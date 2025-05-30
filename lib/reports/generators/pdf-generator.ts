import { DetailedStats } from '@/lib/analysis';
import { ReportOptions } from '../types';
import { InsightsCalculator } from '../utils/insights-calculator';
import jsPDF from 'jspdf';

export class PDFGenerator {
  static async generate(stats: DetailedStats, options: ReportOptions, groupName?: string, startDate?: string, endDate?: string): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    let currentY = margin;
    
    // Configurar fonte
    pdf.setFont('helvetica');
    
    // Cabeçalho do relatório
    currentY = this.addHeader(pdf, groupName, startDate, endDate, currentY, pageWidth, margin);
    
    // Verificar se precisa de nova página
    if (currentY > pageHeight - 40) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Estatísticas gerais
    if (options.includeGeneralStats) {
      currentY = this.addGeneralStats(pdf, stats, currentY, pageWidth, pageHeight, margin);
    }
    
    // Ranking de membros
    if (options.includeMemberRanking) {
      currentY = this.addMemberRanking(pdf, stats, options, currentY, pageWidth, pageHeight, margin);
    }
    
    // Insights automáticos
    if (options.includeInsights) {
      currentY = this.addInsights(pdf, stats, currentY, pageWidth, pageHeight, margin);
    }
    
    // Padrões de atividade
    if (options.includeActivityPatterns) {
      currentY = this.addActivityPatterns(pdf, stats, currentY, pageWidth, pageHeight, margin);
    }
    
    // Análise de engajamento
    if (options.includeEngagementAnalysis) {
      currentY = this.addEngagementAnalysis(pdf, stats, currentY, pageWidth, pageHeight, margin);
    }
    
    // Horários de pico
    if (options.includePeakHours) {
      currentY = this.addPeakHours(pdf, stats, currentY, pageWidth, pageHeight, margin);
    }
    
    // Análise de consistência
    if (options.includeConsistencyAnalysis) {
      currentY = this.addConsistencyAnalysis(pdf, stats, currentY, pageWidth, pageHeight, margin);
    }
    
    // Análise de tendências
    if (options.includeTrendAnalysis) {
      currentY = this.addTrendAnalysis(pdf, stats, currentY, pageWidth, pageHeight, margin);
    }
    
    // Para relatórios de membros - seções específicas
    if (options.showMemberStats) {
      currentY = this.addDetailedMemberStats(pdf, stats, options, currentY, pageWidth, pageHeight, margin);
    }
    
    if (options.showMemberComparison) {
      currentY = this.addMemberComparison(pdf, stats, currentY, pageWidth, pageHeight, margin);
    }
    
    if (options.includeMemberInsights) {
      currentY = this.addMemberInsights(pdf, stats, currentY, pageWidth, pageHeight, margin);
    }
    
    // Rodapé
    this.addFooter(pdf);
    
    return new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' });
  }
  
  private static addHeader(pdf: jsPDF, groupName?: string, startDate?: string, endDate?: string, currentY: number = 20, pageWidth: number = 210, margin: number = 20): number {
    // Título principal
    pdf.setFontSize(24);
    pdf.setTextColor(44, 82, 130); // Azul Apple
    pdf.text('Relatório de Análise WhatsApp', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;
    
    // Subtítulo com informações do grupo
    pdf.setFontSize(14);
    pdf.setTextColor(102, 102, 102);
    if (groupName) {
      pdf.text(`Grupo: ${groupName}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
    }
    
    // Período
    if (startDate && endDate) {
      pdf.text(`Período: ${startDate} a ${endDate}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
    }
    
    // Data de geração
    pdf.setFontSize(10);
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;
    
    // Linha divisória
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;
    
    return currentY;
  }
  
  private static addGeneralStats(pdf: jsPDF, stats: DetailedStats, currentY: number, pageWidth: number, pageHeight: number, margin: number): number {
    // Verificar espaço
    if (currentY > pageHeight - 80) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Título da seção
    pdf.setFontSize(16);
    pdf.setTextColor(44, 82, 130);
    pdf.text('📊 Estatísticas Gerais', margin, currentY);
    currentY += 12;
    
    // Estatísticas em caixas
    const boxWidth = (pageWidth - 3 * margin) / 2;
    const boxHeight = 25;
    
    const stats_data = [
      { label: 'Total de Mensagens', value: stats.total_messages.toLocaleString('pt-BR') },
      { label: 'Membros Ativos', value: stats.active_members.toString() },
      { label: 'Dias Analisados', value: stats.days_analyzed.toString() },
      { label: 'Média Msg/Dia', value: Math.round(stats.total_messages / Math.max(stats.days_analyzed, 1)).toString() },
      { label: 'Palavras/Mensagem', value: stats.avg_words_per_message?.toFixed(1) || 'N/A' },
      { label: 'Total de Palavras', value: stats.total_words?.toLocaleString('pt-BR') || 'N/A' }
    ];
    
    let col = 0;
    let row = 0;
    
    stats_data.forEach((stat, index) => {
      const x = margin + col * (boxWidth + margin);
      const y = currentY + row * (boxHeight + 5);
      
      // Caixa com borda
      pdf.setDrawColor(220, 220, 220);
      pdf.setFillColor(248, 250, 252);
      pdf.rect(x, y, boxWidth, boxHeight, 'FD');
      
      // Label
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.text(stat.label, x + 5, y + 8);
      
      // Valor
      pdf.setFontSize(14);
      pdf.setTextColor(44, 82, 130);
      pdf.text(stat.value, x + 5, y + 18);
      
      col++;
      if (col >= 2) {
        col = 0;
        row++;
      }
    });
    
    currentY += Math.ceil(stats_data.length / 2) * (boxHeight + 5) + 15;
    
    return currentY;
  }
  
  private static addMemberRanking(pdf: jsPDF, stats: DetailedStats, options: ReportOptions, currentY: number, pageWidth: number, pageHeight: number, margin: number): number {
    // Verificar espaço
    if (currentY > pageHeight - 100) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Título da seção
    pdf.setFontSize(16);
    pdf.setTextColor(44, 82, 130);
    pdf.text('🏆 Ranking de Membros', margin, currentY);
    currentY += 12;
    
    const membersToShow = options.maxMembersInRanking === -1 
      ? stats.member_stats.slice(0, 10) // Limitar para PDF
      : stats.member_stats.slice(0, options.maxMembersInRanking);
    
    // Cabeçalho da tabela
    const colWidths = [15, 70, 30, 25, 25];
    const colPositions = [margin, margin + 15, margin + 85, margin + 115, margin + 140];
    
    pdf.setFillColor(44, 82, 130);
    pdf.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');
    
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.text('#', colPositions[0] + 2, currentY + 6);
    pdf.text('Nome', colPositions[1] + 2, currentY + 6);
    pdf.text('Mensagens', colPositions[2] + 2, currentY + 6);
    pdf.text('% Total', colPositions[3] + 2, currentY + 6);
    pdf.text('Palavras/Msg', colPositions[4] + 2, currentY + 6);
    
    currentY += 8;
    
    // Dados dos membros
    pdf.setTextColor(64, 64, 64);
    membersToShow.forEach((member, index) => {
      if (currentY > pageHeight - 30) {
        pdf.addPage();
        currentY = margin;
      }
      
      const percentage = ((member.message_count / stats.total_messages) * 100).toFixed(1);
      const wordsPerMessage = member.avg_words_per_message?.toFixed(1) || 'N/A';
      
      // Alternar cor de fundo
      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, currentY, pageWidth - 2 * margin, 7, 'F');
      }
      
      // Medalhas para top 3
      let position = (index + 1).toString();
      if (index === 0) position = '🥇';
      else if (index === 1) position = '🥈';
      else if (index === 2) position = '🥉';
      
      pdf.setFontSize(9);
      pdf.text(position, colPositions[0] + 2, currentY + 5);
      pdf.text(member.name.length > 25 ? member.name.substring(0, 22) + '...' : member.name, colPositions[1] + 2, currentY + 5);
      pdf.text(member.message_count.toLocaleString('pt-BR'), colPositions[2] + 2, currentY + 5);
      pdf.text(percentage + '%', colPositions[3] + 2, currentY + 5);
      pdf.text(wordsPerMessage, colPositions[4] + 2, currentY + 5);
      
      currentY += 7;
    });
    
    currentY += 10;
    
    return currentY;
  }
  
  private static addInsights(pdf: jsPDF, stats: DetailedStats, currentY: number, pageWidth: number, pageHeight: number, margin: number): number {
    const insights = InsightsCalculator.calculateInsights(stats);
    
    if (insights.length === 0) return currentY;
    
    // Verificar espaço
    if (currentY > pageHeight - 80) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Título da seção
    pdf.setFontSize(16);
    pdf.setTextColor(44, 82, 130);
    pdf.text('💡 Insights Automáticos', margin, currentY);
    currentY += 12;
    
    // Resumo executivo
    const summary = InsightsCalculator.generateSummaryInsight(stats);
    pdf.setFontSize(10);
    pdf.setTextColor(102, 102, 102);
    
    const summaryLines = pdf.splitTextToSize(summary, pageWidth - 2 * margin);
    summaryLines.forEach((line: string) => {
      if (currentY > pageHeight - 30) {
        pdf.addPage();
        currentY = margin;
      }
      pdf.text(line, margin, currentY);
      currentY += 5;
    });
    
    currentY += 8;
    
    // Top insights (máximo 5 para PDF)
    const topInsights = insights.slice(0, 5);
    
    topInsights.forEach((insight) => {
      if (currentY > pageHeight - 40) {
        pdf.addPage();
        currentY = margin;
      }
      
      // Ícone baseado no tipo
      let icon = '📈';
      if (insight.type === 'warning') icon = '⚠️';
      else if (insight.type === 'positive') icon = '✅';
      else if (insight.type === 'neutral') icon = 'ℹ️';
      
      // Título do insight
      pdf.setFontSize(12);
      pdf.setTextColor(44, 82, 130);
      pdf.text(`${icon} ${insight.title}`, margin, currentY);
      currentY += 8;
      
      // Descrição
      pdf.setFontSize(10);
      pdf.setTextColor(64, 64, 64);
      const descLines = pdf.splitTextToSize(insight.description, pageWidth - 2 * margin);
      descLines.forEach((line: string) => {
        if (currentY > pageHeight - 20) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(line, margin + 5, currentY);
        currentY += 5;
      });
      
      // Recomendação (se houver)
      if (insight.recommendation) {
        pdf.setTextColor(102, 102, 102);
        pdf.setFontSize(9);
        const recLines = pdf.splitTextToSize(`💡 ${insight.recommendation}`, pageWidth - 2 * margin);
        recLines.forEach((line: string) => {
          if (currentY > pageHeight - 20) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, margin + 5, currentY);
          currentY += 4;
        });
      }
      
      currentY += 8;
    });
    
    return currentY;
  }
  
  private static addActivityPatterns(pdf: jsPDF, stats: DetailedStats, currentY: number, pageWidth: number, pageHeight: number, margin: number): number {
    // Verificar espaço
    if (currentY > pageHeight - 60) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Título da seção
    pdf.setFontSize(16);
    pdf.setTextColor(44, 82, 130);
    pdf.text('📊 Padrões de Atividade', margin, currentY);
    currentY += 12;
    
    // Encontrar padrões na atividade diária
    const avgMessagesPerDay = stats.total_messages / Math.max(stats.days_analyzed, 1);
    const activeDays = stats.daily_stats.filter(day => day.total_messages > 0).length;
    const consistencyRate = (activeDays / stats.days_analyzed) * 100;
    
    // Análise de picos e vales
    const sortedDays = [...stats.daily_stats].sort((a, b) => b.total_messages - a.total_messages);
    const peakDay = sortedDays[0];
    const quietDay = sortedDays[sortedDays.length - 1];
    
    const patterns = [
      `Consistência: ${consistencyRate.toFixed(1)}% dos dias com atividade`,
      `Dia mais ativo: ${peakDay?.date} (${peakDay?.total_messages} mensagens)`,
      `Dia mais quieto: ${quietDay?.date} (${quietDay?.total_messages} mensagens)`,
      `Variação: ${((peakDay?.total_messages || 0) / Math.max(quietDay?.total_messages || 1, 1)).toFixed(1)}x entre pico e vale`
    ];
    
    pdf.setFontSize(10);
    pdf.setTextColor(64, 64, 64);
    
    patterns.forEach(pattern => {
      if (currentY > pageHeight - 20) {
        pdf.addPage();
        currentY = margin;
      }
      pdf.text(`• ${pattern}`, margin + 5, currentY);
      currentY += 6;
    });
    
    currentY += 10;
    
    return currentY;
  }
  
  private static addEngagementAnalysis(pdf: jsPDF, stats: DetailedStats, currentY: number, pageWidth: number, pageHeight: number, margin: number): number {
    // Verificar espaço
    if (currentY > pageHeight - 60) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Título da seção
    pdf.setFontSize(16);
    pdf.setTextColor(44, 82, 130);
    pdf.text('💬 Análise de Engajamento', margin, currentY);
    currentY += 12;
    
    // Métricas de engajamento
    const messagesPerMember = stats.total_messages / stats.active_members;
    const wordsPerMember = (stats.total_words || 0) / stats.active_members;
    
    // Distribuição de participação
    const topMember = stats.member_stats[0];
    const topMemberPercentage = (topMember.message_count / stats.total_messages) * 100;
    
    const top3Messages = stats.member_stats.slice(0, 3).reduce((sum, member) => sum + member.message_count, 0);
    const top3Percentage = (top3Messages / stats.total_messages) * 100;
    
    const engagementMetrics = [
      `Mensagens por membro: ${messagesPerMember.toFixed(1)} em média`,
      `Palavras por membro: ${wordsPerMember.toFixed(0)} em média`,
      `Concentração: ${topMemberPercentage.toFixed(1)}% das mensagens pelo membro mais ativo`,
      `Top 3 dominância: ${top3Percentage.toFixed(1)}% das mensagens pelos 3 mais ativos`
    ];
    
    pdf.setFontSize(10);
    pdf.setTextColor(64, 64, 64);
    
    engagementMetrics.forEach(metric => {
      if (currentY > pageHeight - 20) {
        pdf.addPage();
        currentY = margin;
      }
      pdf.text(`• ${metric}`, margin + 5, currentY);
      currentY += 6;
    });
    
    currentY += 10;
    
    return currentY;
  }
  
  private static addPeakHours(pdf: jsPDF, stats: DetailedStats, currentY: number, pageWidth: number, pageHeight: number, margin: number): number {
    if (!stats.hourly_activity) return currentY;
    
    // Verificar espaço
    if (currentY > pageHeight - 60) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Título da seção
    pdf.setFontSize(16);
    pdf.setTextColor(44, 82, 130);
    pdf.text('⏰ Horários de Pico', margin, currentY);
    currentY += 12;
    
    // Encontrar top 5 horários
    const hourlyEntries = Object.entries(stats.hourly_activity)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    pdf.setFontSize(10);
    pdf.setTextColor(64, 64, 64);
    
    hourlyEntries.forEach((entry, index) => {
      if (currentY > pageHeight - 20) {
        pdf.addPage();
        currentY = margin;
      }
      
      const percentage = ((entry.count / stats.total_messages) * 100).toFixed(1);
      pdf.text(`${index + 1}. ${entry.hour}:00 - ${entry.count} mensagens (${percentage}%)`, margin + 5, currentY);
      currentY += 6;
    });
    
    currentY += 10;
    
    return currentY;
  }
  
  private static addConsistencyAnalysis(pdf: jsPDF, stats: DetailedStats, currentY: number, pageWidth: number, pageHeight: number, margin: number): number {
    return currentY + 10; // Placeholder
  }
  
  private static addTrendAnalysis(pdf: jsPDF, stats: DetailedStats, currentY: number, pageWidth: number, pageHeight: number, margin: number): number {
    return currentY + 10; // Placeholder
  }
  
  private static addDetailedMemberStats(pdf: jsPDF, stats: DetailedStats, options: ReportOptions, currentY: number, pageWidth: number, pageHeight: number, margin: number): number {
    return currentY + 10; // Placeholder
  }
  
  private static addMemberComparison(pdf: jsPDF, stats: DetailedStats, currentY: number, pageWidth: number, pageHeight: number, margin: number): number {
    return currentY + 10; // Placeholder
  }
  
  private static addMemberInsights(pdf: jsPDF, stats: DetailedStats, currentY: number, pageWidth: number, pageHeight: number, margin: number): number {
    return currentY + 10; // Placeholder
  }
  
  private static addFooter(pdf: jsPDF): void {
    const pageCount = pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      // Rodapé
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Gerado pela plataforma Omnys', 20, pdf.internal.pageSize.height - 10);
      pdf.text(`Página ${i} de ${pageCount}`, pdf.internal.pageSize.width - 20, pdf.internal.pageSize.height - 10, { align: 'right' });
    }
  }
} 