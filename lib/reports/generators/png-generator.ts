import { DetailedStats } from '@/lib/analysis';
import { ReportOptions } from '../types';
import { InsightsCalculator } from '../utils/insights-calculator';

export class PNGGenerator {
  static async generate(stats: DetailedStats, options: ReportOptions, groupName?: string, startDate?: string, endDate?: string): Promise<Blob> {
    // Criar canvas para o PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Não foi possível criar contexto do canvas');
    }
    
    // Configurar tamanho baseado no conteúdo
    const width = 1200;
    const height = this.calculateCanvasHeight(stats, options);
    
    canvas.width = width;
    canvas.height = height;
    
    // Configurar estilo base
    this.setupCanvas(ctx, width, height, options.colorTheme || 'blue');
    
    let currentY = 60;
    
    // Cabeçalho
    currentY = this.addHeader(ctx, width, currentY, groupName, startDate, endDate, options.colorTheme || 'blue');
    
    // Estatísticas gerais
    if (options.includeGeneralStats) {
      currentY = this.addGeneralStats(ctx, stats, width, currentY, options.colorTheme || 'blue');
    }
    
    // Ranking de membros
    if (options.includeMemberRanking) {
      currentY = this.addMemberRanking(ctx, stats, options, width, currentY, options.colorTheme || 'blue');
    }
    
    // Padrões de atividade
    if (options.includeActivityPatterns) {
      currentY = this.addActivityPatterns(ctx, stats, width, currentY, options.colorTheme || 'blue');
    }
    
    // Horários de pico
    if (options.includePeakHours) {
      currentY = this.addPeakHours(ctx, stats, width, currentY, options.colorTheme || 'blue');
    }
    
    // Converter canvas para blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 1.0);
    });
  }
  
  private static calculateCanvasHeight(stats: DetailedStats, options: ReportOptions): number {
    let height = 200; // Header básico
    
    if (options.includeGeneralStats) height += 200;
    if (options.includeMemberRanking) {
      const memberCount = options.maxMembersInRanking === -1 ? Math.min(stats.member_stats.length, 10) : options.maxMembersInRanking;
      height += 120 + (memberCount * 60);
    }
    if (options.includeActivityPatterns) height += 150;
    if (options.includePeakHours) height += 200;
    
    return Math.max(height, 800);
  }
  
  private static setupCanvas(ctx: CanvasRenderingContext2D, width: number, height: number, theme: string): void {
    // Background com gradiente baseado no tema
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    
    switch (theme) {
      case 'blue':
        gradient.addColorStop(0, '#f0f9ff');
        gradient.addColorStop(1, '#e0f2fe');
        break;
      case 'green':
        gradient.addColorStop(0, '#f0fdf4');
        gradient.addColorStop(1, '#dcfce7');
        break;
      case 'purple':
        gradient.addColorStop(0, '#faf5ff');
        gradient.addColorStop(1, '#f3e8ff');
        break;
      case 'orange':
        gradient.addColorStop(0, '#fff7ed');
        gradient.addColorStop(1, '#fed7aa');
        break;
      default:
        gradient.addColorStop(0, '#f8fafc');
        gradient.addColorStop(1, '#e2e8f0');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  private static addHeader(ctx: CanvasRenderingContext2D, width: number, currentY: number, groupName?: string, startDate?: string, endDate?: string, theme: string = 'blue'): number {
    // Título principal
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = this.getThemeColor(theme);
    ctx.textAlign = 'center';
    ctx.fillText('Relatório WhatsApp', width / 2, currentY);
    currentY += 60;
    
    // Nome do grupo
    if (groupName) {
      ctx.font = '32px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#374151';
      ctx.fillText(groupName, width / 2, currentY);
      currentY += 40;
    }
    
    // Período
    if (startDate && endDate) {
      ctx.font = '24px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(`${startDate} - ${endDate}`, width / 2, currentY);
      currentY += 35;
    }
    
    // Data de geração
    ctx.font = '18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, width / 2, currentY);
    currentY += 50;
    
    return currentY;
  }
  
  private static addGeneralStats(ctx: CanvasRenderingContext2D, stats: DetailedStats, width: number, currentY: number, theme: string): number {
    // Título da seção
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = this.getThemeColor(theme);
    ctx.textAlign = 'center';
    ctx.fillText('📊 Estatísticas Gerais', width / 2, currentY);
    currentY += 50;
    
    // Cards com estatísticas
    const cardWidth = 350;
    const cardHeight = 120;
    const cardsPerRow = 3;
    const cardSpacing = 40;
    const startX = (width - (cardsPerRow * cardWidth + (cardsPerRow - 1) * cardSpacing)) / 2;
    
    const statsData = [
      { label: 'Mensagens', value: stats.total_messages.toLocaleString('pt-BR'), icon: '💬' },
      { label: 'Membros Ativos', value: stats.active_members.toString(), icon: '👥' },
      { label: 'Dias Analisados', value: stats.days_analyzed.toString(), icon: '📅' },
      { label: 'Média/Dia', value: Math.round(stats.total_messages / Math.max(stats.days_analyzed, 1)).toString(), icon: '📈' },
      { label: 'Palavras/Msg', value: stats.avg_words_per_message?.toFixed(1) || 'N/A', icon: '📝' },
      { label: 'Total Palavras', value: stats.total_words?.toLocaleString('pt-BR') || 'N/A', icon: '📚' }
    ];
    
    statsData.forEach((stat, index) => {
      const col = index % cardsPerRow;
      const row = Math.floor(index / cardsPerRow);
      const x = startX + col * (cardWidth + cardSpacing);
      const y = currentY + row * (cardHeight + 20);
      
      // Card background com sombra Apple
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
      
      const cardGradient = ctx.createLinearGradient(x, y, x, y + cardHeight);
      cardGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      cardGradient.addColorStop(1, 'rgba(255, 255, 255, 0.7)');
      
      ctx.fillStyle = cardGradient;
      ctx.fillRect(x, y, cardWidth, cardHeight);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // Borda sutil
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cardWidth, cardHeight);
      
      // Ícone
      ctx.font = '32px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = this.getThemeColor(theme);
      ctx.textAlign = 'left';
      ctx.fillText(stat.icon, x + 20, y + 45);
      
      // Label
      ctx.font = '18px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(stat.label, x + 70, y + 35);
      
      // Valor
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#111827';
      ctx.fillText(stat.value, x + 70, y + 70);
    });
    
    currentY += Math.ceil(statsData.length / cardsPerRow) * (cardHeight + 20) + 40;
    
    return currentY;
  }
  
  private static addMemberRanking(ctx: CanvasRenderingContext2D, stats: DetailedStats, options: ReportOptions, width: number, currentY: number, theme: string): number {
    // Título da seção
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = this.getThemeColor(theme);
    ctx.textAlign = 'center';
    ctx.fillText('🏆 Ranking de Membros', width / 2, currentY);
    currentY += 50;
    
    const membersToShow = options.maxMembersInRanking === -1 
      ? stats.member_stats.slice(0, 10) // Limitar para PNG
      : stats.member_stats.slice(0, options.maxMembersInRanking);
    
    if (options.rankingDisplay === 'cards') {
      // Layout em cards
      const cardWidth = 380;
      const cardHeight = 80;
      const cardsPerRow = 3;
      const cardSpacing = 20;
      const startX = (width - (cardsPerRow * cardWidth + (cardsPerRow - 1) * cardSpacing)) / 2;
      
      membersToShow.forEach((member, index) => {
        const col = index % cardsPerRow;
        const row = Math.floor(index / cardsPerRow);
        const x = startX + col * (cardWidth + cardSpacing);
        const y = currentY + row * (cardHeight + 15);
        
        // Background do card
        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 5;
        
        const cardGradient = ctx.createLinearGradient(x, y, x, y + cardHeight);
        cardGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        cardGradient.addColorStop(1, 'rgba(255, 255, 255, 0.85)');
        
        ctx.fillStyle = cardGradient;
        ctx.fillRect(x, y, cardWidth, cardHeight);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        // Borda
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cardWidth, cardHeight);
        
        // Medalha/posição
        ctx.font = '24px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = this.getThemeColor(theme);
        ctx.textAlign = 'left';
        
        let position = `#${index + 1}`;
        if (index === 0) position = '🥇';
        else if (index === 1) position = '🥈';
        else if (index === 2) position = '🥉';
        
        ctx.fillText(position, x + 15, y + 35);
        
        // Nome do membro
        ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#111827';
        const memberName = member.name.length > 18 ? member.name.substring(0, 15) + '...' : member.name;
        ctx.fillText(memberName, x + 70, y + 30);
        
        // Estatísticas
        ctx.font = '16px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#6b7280';
        const percentage = ((member.message_count / stats.total_messages) * 100).toFixed(1);
        ctx.fillText(`${member.message_count} msgs (${percentage}%)`, x + 70, y + 55);
      });
      
      currentY += Math.ceil(membersToShow.length / cardsPerRow) * (cardHeight + 15) + 30;
    }
    
    return currentY;
  }
  
  private static addActivityPatterns(ctx: CanvasRenderingContext2D, stats: DetailedStats, width: number, currentY: number, theme: string): number {
    // Título da seção
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = this.getThemeColor(theme);
    ctx.textAlign = 'center';
    ctx.fillText('📊 Padrões de Atividade', width / 2, currentY);
    currentY += 40;
    
    // Métricas de padrões
    const activeDays = stats.daily_stats.filter(day => day.total_messages > 0).length;
    const consistencyRate = (activeDays / stats.days_analyzed) * 100;
    
    const patterns = [
      `Consistência: ${consistencyRate.toFixed(1)}% dos dias com atividade`,
      `Média diária: ${Math.round(stats.total_messages / Math.max(stats.days_analyzed, 1))} mensagens`,
      `Pico de atividade: ${Math.max(...stats.daily_stats.map(d => d.total_messages))} mensagens em um dia`
    ];
    
    ctx.font = '20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'center';
    
    patterns.forEach(pattern => {
      ctx.fillText(pattern, width / 2, currentY);
      currentY += 35;
    });
    
    currentY += 20;
    
    return currentY;
  }
  
  private static addPeakHours(ctx: CanvasRenderingContext2D, stats: DetailedStats, width: number, currentY: number, theme: string): number {
    if (!stats.hourly_activity) return currentY;
    
    // Título da seção
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = this.getThemeColor(theme);
    ctx.textAlign = 'center';
    ctx.fillText('⏰ Horários de Pico', width / 2, currentY);
    currentY += 50;
    
    // Encontrar top 5 horários
    const hourlyEntries = Object.entries(stats.hourly_activity)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Mostrar em barras horizontais
    const barWidth = 600;
    const barHeight = 30;
    const startX = (width - barWidth) / 2;
    const maxCount = hourlyEntries[0]?.count || 1;
    
    hourlyEntries.forEach((entry, index) => {
      const y = currentY + index * (barHeight + 15);
      const barLength = (entry.count / maxCount) * barWidth;
      
      // Background da barra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(startX, y, barWidth, barHeight);
      
      // Barra colorida
      const barGradient = ctx.createLinearGradient(startX, y, startX + barLength, y);
      barGradient.addColorStop(0, this.getThemeColor(theme));
      barGradient.addColorStop(1, this.getThemeColorLight(theme));
      
      ctx.fillStyle = barGradient;
      ctx.fillRect(startX, y, barLength, barHeight);
      
      // Texto do horário
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(`${entry.hour}:00`, startX + 10, y + 20);
      
      // Valor
      ctx.textAlign = 'right';
      const percentage = ((entry.count / stats.total_messages) * 100).toFixed(1);
      ctx.fillText(`${entry.count} (${percentage}%)`, startX + barWidth - 10, y + 20);
    });
    
    currentY += hourlyEntries.length * (barHeight + 15) + 30;
    
    return currentY;
  }
  
  private static getThemeColor(theme: string): string {
    switch (theme) {
      case 'blue': return '#2563eb';
      case 'green': return '#059669';
      case 'purple': return '#7c3aed';
      case 'orange': return '#ea580c';
      case 'red': return '#dc2626';
      case 'teal': return '#0d9488';
      default: return '#2563eb';
    }
  }
  
  private static getThemeColorLight(theme: string): string {
    switch (theme) {
      case 'blue': return '#60a5fa';
      case 'green': return '#34d399';
      case 'purple': return '#a78bfa';
      case 'orange': return '#fb923c';
      case 'red': return '#f87171';
      case 'teal': return '#5eead4';
      default: return '#60a5fa';
    }
  }
} 