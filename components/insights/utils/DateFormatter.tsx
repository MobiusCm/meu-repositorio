import { format, parse, differenceInDays, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export class DateFormatter {
  // Formatar período para exibição
  static formatPeriod(start: Date, end: Date): string {
    const startFormatted = format(start, 'dd/MM/yyyy', { locale: ptBR });
    const endFormatted = format(end, 'dd/MM/yyyy', { locale: ptBR });
    const days = differenceInDays(end, start) + 1;
    
    return `${startFormatted} até ${endFormatted} (${days} dias)`;
  }

  // Formatar data para exibição curta
  static formatDayMonth(date: Date): string {
    return format(date, 'dd/MM', { locale: ptBR });
  }

  // Obter semanas do período
  static getWeekRanges(start: Date, end: Date): Array<{ start: Date; end: Date; label: string }> {
    const weeks: Array<{ start: Date; end: Date; label: string }> = [];
    let currentStart = new Date(start);
    let weekNumber = 1;
    
    while (currentStart <= end) {
      const weekEnd = new Date(Math.min(
        addDays(currentStart, 6).getTime(),
        end.getTime()
      ));
      
      weeks.push({
        start: new Date(currentStart),
        end: weekEnd,
        label: `Semana ${weekNumber}`
      });
      
      currentStart = addDays(weekEnd, 1);
      weekNumber++;
    }
    
    return weeks;
  }

  // Dividir período em duas metades para comparação
  static splitPeriod(start: Date, end: Date): { first: { start: Date; end: Date }; second: { start: Date; end: Date } } {
    const totalDays = differenceInDays(end, start) + 1;
    const halfDays = Math.floor(totalDays / 2);
    
    const firstEnd = addDays(start, halfDays - 1);
    const secondStart = addDays(firstEnd, 1);
    
    return {
      first: { start: new Date(start), end: firstEnd },
      second: { start: secondStart, end: new Date(end) }
    };
  }

  // Parse de string de data DD/MM/YYYY
  static parseDate(dateString: string): Date {
    if (dateString.includes('/')) {
      return parse(dateString, 'dd/MM/yyyy', new Date());
    }
    return parseISO(dateString);
  }

  // Parse de string ISO
  static parseISODate(dateString: string): Date {
    return parseISO(dateString);
  }

  // Formatar comparação de períodos
  static formatComparison(start: Date, end: Date): string {
    const days = differenceInDays(end, start) + 1;
    
    if (days === 1) {
      return format(start, 'dd/MM/yyyy', { locale: ptBR });
    } else if (days <= 7) {
      return `${days} dias (${this.formatDayMonth(start)} - ${this.formatDayMonth(end)})`;
    } else if (days <= 31) {
      const weeks = Math.ceil(days / 7);
      return `${weeks} semana${weeks > 1 ? 's' : ''} (${this.formatDayMonth(start)} - ${this.formatDayMonth(end)})`;
    } else {
      const months = Math.ceil(days / 30);
      return `${months} ${months === 1 ? 'mês' : 'meses'} (${this.formatDayMonth(start)} - ${this.formatDayMonth(end)})`;
    }
  }

  // Formatar para gráfico
  static formatForChart(date: Date): string {
    return format(date, 'dd/MM', { locale: ptBR });
  }

  // Obter nome do dia da semana
  static getDayName(date: Date): string {
    return format(date, 'EEEE', { locale: ptBR });
  }

  // Verificar se é fim de semana
  static isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // domingo ou sábado
  }

  // Formatar hora para exibição
  static formatTime(date: Date): string {
    return format(date, 'HH:mm', { locale: ptBR });
  }

  // Obter diferença em dias de forma humanizada
  static getHumanizedDaysDifference(date1: Date, date2: Date): string {
    const days = Math.abs(differenceInDays(date2, date1));
    
    if (days === 0) return 'hoje';
    if (days === 1) return 'ontem';
    if (days <= 7) return `${days} dias atrás`;
    if (days <= 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} semana${weeks > 1 ? 's' : ''} atrás`;
    }
    
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'mês' : 'meses'} atrás`;
  }

  // Validar se uma data está dentro de um período
  static isDateInRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
  }

  // Obter array de datas entre duas datas
  static getDatesBetween(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  }
} 