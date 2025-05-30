import { createClient } from '@/lib/supabase/client';
import { fetchPreProcessedStats, DetailedStats } from '@/lib/analysis';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';

// Interfaces corretas
export interface ReportOptions {
  includeGeneralStats: boolean;
  includeDailyActivity: boolean;
  includeMemberRanking: boolean;
  includeHourlyActivity: boolean;
  includeInsights: boolean;
  maxMembersInRanking: number;
  colorTheme: 'blue' | 'green' | 'purple' | 'orange';
  rankingDisplay: 'table' | 'cards';
  showMemberStats: boolean;
  showActivityTrends: boolean;
}

export interface ReportData {
  group: { id: string; name: string };
  period: { startDate: Date; endDate: Date };
  template: 'complete' | 'members';
  format: 'csv' | 'pdf' | 'png';
  options: ReportOptions;
  stats: DetailedStats;
}

// Função auxiliar para calcular insights básicos
function calculateInsights(stats: DetailedStats): string[] {
  const insights = [];
  
  // Calcular média de mensagens por dia
  const avgMessagesPerDay = Math.round(stats.total_messages / stats.days_analyzed);
  
  // Encontrar horário de pico - usando distribuição horária se disponível
  const hourlyActivity = stats.hourly_activity || {};
  const peakHour = Object.keys(hourlyActivity).reduce((max, hour) => 
    hourlyActivity[hour] > (hourlyActivity[max] || 0) ? hour : max, '12'
  );
  
  insights.push(`O grupo tem uma média de ${avgMessagesPerDay} mensagens por dia.`);
  
  if (stats.member_stats && stats.member_stats.length > 0) {
    const topMember = stats.member_stats[0];
    const participation = ((topMember.message_count / stats.total_messages) * 100).toFixed(1);
    insights.push(`${topMember.name} é o membro mais ativo, representando ${participation}% das mensagens.`);
  }
  
  if (peakHour && hourlyActivity[peakHour]) {
    insights.push(`O horário de maior atividade é às ${peakHour}h.`);
  }
  
  if (stats.total_words && stats.total_messages) {
    const avgWordsPerMessage = Math.round(stats.total_words / stats.total_messages);
    insights.push(`Cada mensagem tem em média ${avgWordsPerMessage} palavras.`);
  }
  
  return insights;
}

export async function generateCSV(reportData: ReportData): Promise<string> {
  const { stats, options, template } = reportData;
  let csvContent = '\uFEFF'; // UTF-8 BOM para caracteres especiais
  
  if (template === 'complete') {
    // Relatório completo
    if (options.includeGeneralStats) {
      csvContent += 'ESTATÍSTICAS GERAIS\n';
      csvContent += 'Métrica,Valor\n';
      csvContent += `Total de Mensagens,${stats.total_messages}\n`;
      csvContent += `Total de Palavras,${stats.total_words || 0}\n`;
      csvContent += `Membros Ativos,${stats.active_members}\n`;
      csvContent += `Dias Analisados,${stats.days_analyzed}\n`;
      csvContent += `Média por Dia,${Math.round(stats.total_messages / stats.days_analyzed)}\n`;
      csvContent += '\n';
    }
    
    if (options.includeMemberRanking && stats.member_stats) {
      csvContent += 'RANKING DE MEMBROS\n';
      csvContent += 'Posição,Nome,Mensagens,Participação (%)\n';
      const maxMembers = options.maxMembersInRanking === -1 ? stats.member_stats.length : options.maxMembersInRanking;
      stats.member_stats.slice(0, maxMembers).forEach((member, index) => {
        const participation = ((member.message_count / stats.total_messages) * 100).toFixed(1);
        csvContent += `${index + 1},${member.name},${member.message_count},${participation}\n`;
      });
      csvContent += '\n';
    }
    
    if (options.includeHourlyActivity && stats.hourly_activity) {
      csvContent += 'ATIVIDADE POR HORA\n';
      csvContent += 'Hora,Mensagens\n';
      Object.entries(stats.hourly_activity).forEach(([hour, count]) => {
        csvContent += `${hour}:00,${count}\n`;
      });
      csvContent += '\n';
    }
    
    if (options.includeDailyActivity && stats.daily_stats) {
      csvContent += 'ATIVIDADE DIÁRIA\n';
      csvContent += 'Data,Mensagens\n';
      Object.entries(stats.daily_stats).forEach(([date, count]) => {
        csvContent += `${date},${count}\n`;
      });
    }
  } else {
    // Relatório de membros
    if (stats.member_stats) {
      csvContent += 'RANKING COMPLETO DE MEMBROS\n';
      csvContent += 'Posição,Nome,Mensagens,Participação (%),Palavras Totais\n';
      const maxMembers = options.maxMembersInRanking === -1 ? stats.member_stats.length : options.maxMembersInRanking;
      stats.member_stats.slice(0, maxMembers).forEach((member, index) => {
        const participation = ((member.message_count / stats.total_messages) * 100).toFixed(1);
        const words = member.word_count || 0;
        csvContent += `${index + 1},${member.name},${member.message_count},${participation},${words}\n`;
      });
    }
  }
  
  return csvContent;
}

export async function generatePDF(reportData: ReportData): Promise<Uint8Array> {
  const { stats, options, template, group, period } = reportData;
  const doc = new jsPDF();
  
  // Configurações
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;
  const lineHeight = 7;
  
  // Função auxiliar para adicionar texto
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    doc.text(text, margin, yPos);
    yPos += lineHeight;
  };
  
  // Cabeçalho
  addText(template === 'complete' ? 'RELATÓRIO COMPLETO' : 'RELATÓRIO DE MEMBROS', 18, true);
  addText(group.name, 14, true);
  addText(`Período: ${format(period.startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(period.endDate, 'dd/MM/yyyy', { locale: ptBR })}`, 10);
  addText(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 10);
  yPos += 10;
  
  if (template === 'complete') {
    // Estatísticas gerais
    if (options.includeGeneralStats) {
      addText('ESTATÍSTICAS GERAIS', 14, true);
      addText(`Total de Mensagens: ${stats.total_messages.toLocaleString('pt-BR')}`);
      addText(`Membros Ativos: ${stats.active_members}`);
      addText(`Dias Analisados: ${stats.days_analyzed}`);
      addText(`Média por Dia: ${Math.round(stats.total_messages / stats.days_analyzed)}`);
      if (stats.total_words) {
        addText(`Total de Palavras: ${stats.total_words.toLocaleString('pt-BR')}`);
        addText(`Média de Palavras por Mensagem: ${Math.round(stats.total_words / stats.total_messages)}`);
      }
      yPos += 10;
    }
    
    // Ranking de membros
    if (options.includeMemberRanking && stats.member_stats) {
      addText('RANKING DE MEMBROS', 14, true);
      const maxMembers = options.maxMembersInRanking === -1 ? Math.min(stats.member_stats.length, 20) : options.maxMembersInRanking;
      stats.member_stats.slice(0, maxMembers).forEach((member, index) => {
        const participation = ((member.message_count / stats.total_messages) * 100).toFixed(1);
        addText(`${index + 1}º ${member.name} - ${member.message_count} mensagens (${participation}%)`);
      });
      yPos += 10;
    }
    
    // Insights
    if (options.includeInsights) {
      addText('INSIGHTS E ANÁLISES', 14, true);
      const insights = calculateInsights(stats);
      insights.forEach(insight => addText(`• ${insight}`));
    }
  } else {
    // Relatório de membros
    if (stats.member_stats) {
      addText('RANKING COMPLETO DE MEMBROS', 14, true);
      const maxMembers = options.maxMembersInRanking === -1 ? stats.member_stats.length : options.maxMembersInRanking;
      
      stats.member_stats.slice(0, maxMembers).forEach((member, index) => {
        const participation = ((member.message_count / stats.total_messages) * 100).toFixed(1);
        
        if (options.rankingDisplay === 'cards') {
          // Formato de cards no PDF
          if (yPos > 250) {
            doc.addPage();
            yPos = margin;
          }
          
          // Desenhar um retângulo para simular card
          doc.setDrawColor(200, 200, 200);
          doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 15);
          
          addText(`${index + 1}º LUGAR`, 10, true);
          yPos -= lineHeight;
          addText(`${member.name}`, 12, true);
          addText(`${member.message_count} mensagens • ${participation}% do total`);
          yPos += 5;
        } else {
          // Formato de tabela
          addText(`${index + 1}º ${member.name} - ${member.message_count} mensagens (${participation}%)`);
        }
      });
    }
  }
  
  return new Uint8Array(doc.output('arraybuffer'));
}

export async function generatePNG(reportData: ReportData): Promise<Blob> {
  const { stats, options, template, group, period } = reportData;
  
  // Criar canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Configurações
  canvas.width = 800;
  canvas.height = template === 'complete' ? 600 : 800;
  
  // Cores baseadas no tema
  const themes = {
    blue: { primary: '#3B82F6', secondary: '#EFF6FF', accent: '#1E40AF' },
    green: { primary: '#10B981', secondary: '#F0FDF4', accent: '#047857' },
    purple: { primary: '#8B5CF6', secondary: '#FAF5FF', accent: '#6D28D9' },
    orange: { primary: '#F59E0B', secondary: '#FFFBEB', accent: '#D97706' }
  };
  
  const theme = themes[options.colorTheme];
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, theme.secondary);
  gradient.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Função auxiliar para desenhar cards
  const drawCard = (x: number, y: number, width: number, height: number, content: () => void) => {
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(x + 3, y + 3, width, height);
    
    // Card
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, width, height);
    
    // Borda
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    content();
  };
  
  // Header
  drawCard(40, 40, canvas.width - 80, 100, () => {
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(group.name, 60, 80);
    
    ctx.fillStyle = '#6B7280';
    ctx.font = '16px Arial';
    ctx.fillText(template === 'complete' ? 'Relatório Completo' : 'Ranking de Membros', 60, 105);
    
    ctx.font = '14px Arial';
    ctx.fillText(`${format(period.startDate, 'dd/MM/yyyy')} - ${format(period.endDate, 'dd/MM/yyyy')}`, 60, 125);
  });
  
  if (template === 'complete') {
    // Cards de métricas
    const metrics = [
      { label: 'Total Mensagens', value: stats.total_messages.toLocaleString('pt-BR'), color: theme.primary },
      { label: 'Membros Ativos', value: stats.active_members.toString(), color: theme.accent },
      { label: 'Média/Dia', value: Math.round(stats.total_messages / stats.days_analyzed).toString(), color: theme.primary }
    ];
    
    metrics.forEach((metric, index) => {
      const x = 40 + (index * 240);
      drawCard(x, 180, 220, 120, () => {
        ctx.fillStyle = metric.color;
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(metric.value, x + 110, 235);
        
        ctx.fillStyle = '#6B7280';
        ctx.font = '16px Arial';
        ctx.fillText(metric.label, x + 110, 260);
        ctx.textAlign = 'left';
      });
    });
    
    // Top 3 membros
    if (options.includeMemberRanking && stats.member_stats) {
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('TOP MEMBROS', 60, 360);
      
      stats.member_stats.slice(0, 3).forEach((member, index) => {
        const y = 380 + (index * 60);
        const colors = ['#F59E0B', '#94A3B8', '#CD7C2F'];
        
        drawCard(60, y, canvas.width - 120, 50, () => {
          // Medal/position
          ctx.fillStyle = colors[index];
          ctx.beginPath();
          ctx.arc(90, y + 25, 20, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText((index + 1).toString(), 90, y + 30);
          
          // Nome
          ctx.fillStyle = '#1F2937';
          ctx.font = 'bold 18px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(member.name, 130, y + 30);
          
          // Mensagens
          ctx.fillStyle = theme.primary;
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'right';
          ctx.fillText(`${member.message_count} msgs`, canvas.width - 80, y + 30);
          ctx.textAlign = 'left';
        });
      });
    }
  } else {
    // Ranking de membros
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('TOP MEMBROS', 60, 200);
    
    if (stats.member_stats) {
      const maxMembers = Math.min(stats.member_stats.length, 8);
      
      stats.member_stats.slice(0, maxMembers).forEach((member, index) => {
        const y = 230 + (index * 65);
        const medals = ['🥇', '🥈', '🥉'];
        
        drawCard(60, y, canvas.width - 120, 55, () => {
          // Position/Medal
          if (index < 3) {
            ctx.font = '24px Arial';
            ctx.fillText(medals[index], 80, y + 35);
          } else {
            ctx.fillStyle = theme.primary;
            ctx.beginPath();
            ctx.arc(95, y + 27.5, 18, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText((index + 1).toString(), 95, y + 32);
            ctx.textAlign = 'left';
          }
          
          // Nome
          ctx.fillStyle = '#1F2937';
          ctx.font = 'bold 20px Arial';
          ctx.fillText(member.name, 130, y + 32);
          
          // Estatísticas
          const participation = ((member.message_count / stats.total_messages) * 100).toFixed(1);
          ctx.fillStyle = '#6B7280';
          ctx.font = '14px Arial';
          ctx.fillText(`${member.message_count} mensagens (${participation}%)`, 130, y + 48);
          
          // Badge de participação
          ctx.fillStyle = theme.secondary;
          ctx.fillRect(canvas.width - 160, y + 15, 80, 25);
          ctx.fillStyle = theme.primary;
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${participation}%`, canvas.width - 120, y + 32);
          ctx.textAlign = 'left';
        });
      });
    }
  }
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png', 1.0);
  });
}

export async function validateGroupForReport(groupId: string): Promise<{
  isValid: boolean;
  message?: string;
  stats?: DetailedStats;
}> {
  try {
    const supabase = createClient();
    
    // Verificar se o grupo existe
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('id', groupId)
      .single();
    
    if (groupError || !group) {
      return {
        isValid: false,
        message: 'Grupo não encontrado'
      };
    }
    
    // Verificar se há dados suficientes para gerar relatório
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Últimos 7 dias
    
    const stats = await fetchPreProcessedStats(groupId, startDate, endDate);
    
    if (!stats || stats.total_messages === 0) {
      return {
        isValid: false,
        message: 'Grupo não possui dados suficientes para gerar relatório'
      };
    }
    
    return {
      isValid: true,
      stats
    };
  } catch (error) {
    return {
      isValid: false,
      message: 'Erro ao validar grupo para relatório'
    };
  }
} 