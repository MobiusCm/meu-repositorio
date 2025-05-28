'use client';

import { useState, useEffect } from 'react';
import { format, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, ChevronDown, Check } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface PeriodSelectorProps {
  availableDates: Date[];
  minDate: Date | null;
  maxDate: Date | null;
  selectedRange: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  daysAnalyzed?: number;
  className?: string;
}

type PeriodOption = 'last7' | 'last15' | 'last30' | 'all' | 'custom';

interface PeriodPreset {
  id: PeriodOption;
  label: string;
  shortLabel: string;
  getDates: (availableDates: Date[]) => DateRange | undefined;
}

export function PeriodSelector({
  availableDates,
  minDate,
  maxDate,
  selectedRange,
  onRangeChange,
  daysAnalyzed = 0,
  className = ''
}: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentOption, setCurrentOption] = useState<PeriodOption>('last7');
  const [tempRange, setTempRange] = useState<DateRange | undefined>(selectedRange);

  const presets: PeriodPreset[] = [
    {
      id: 'last7',
      label: 'Últimos 7 dias',
      shortLabel: '7 dias',
      getDates: (dates) => {
        if (dates.length === 0) return undefined;
        const last7 = dates.slice(-7);
        return { from: last7[0], to: last7[last7.length - 1] };
      }
    },
    {
      id: 'last15',
      label: 'Últimos 15 dias',
      shortLabel: '15 dias',
      getDates: (dates) => {
        if (dates.length === 0) return undefined;
        const last15 = dates.slice(-15);
        return { from: last15[0], to: last15[last15.length - 1] };
      }
    },
    {
      id: 'last30',
      label: 'Últimos 30 dias',
      shortLabel: '30 dias',
      getDates: (dates) => {
        if (dates.length === 0) return undefined;
        const last30 = dates.slice(-30);
        return { from: last30[0], to: last30[last30.length - 1] };
      }
    },
    {
      id: 'all',
      label: 'Todo o período',
      shortLabel: 'Tudo',
      getDates: (dates) => {
        if (dates.length === 0) return undefined;
        return { from: dates[0], to: dates[dates.length - 1] };
      }
    },
    {
      id: 'custom',
      label: 'Personalizado',
      shortLabel: 'Custom',
      getDates: () => undefined
    }
  ];

  // Detectar qual preset está selecionado baseado no range atual
  useEffect(() => {
    if (!selectedRange?.from || !selectedRange?.to) return;
    
    for (const preset of presets.slice(0, 4)) {
      const presetRange = preset.getDates(availableDates);
      if (presetRange && 
          presetRange.from?.getTime() === selectedRange.from.getTime() &&
          presetRange.to?.getTime() === selectedRange.to.getTime()) {
        setCurrentOption(preset.id);
        return;
      }
    }
    setCurrentOption('custom');
  }, [selectedRange, availableDates]);

  const handlePresetSelect = (preset: PeriodPreset) => {
    setCurrentOption(preset.id);
    
    if (preset.id === 'custom') {
      setTempRange(selectedRange);
      return;
    }
    
    const newRange = preset.getDates(availableDates);
    if (newRange) {
      onRangeChange(newRange);
      setIsOpen(false);
    }
  };

  const handleCustomRangeChange = (range: DateRange | undefined) => {
    setTempRange(range);
  };

  const applyCustomRange = () => {
    if (tempRange?.from) {
      onRangeChange(tempRange);
      setIsOpen(false);
    }
  };

  const formatSelectedPeriod = () => {
    if (!selectedRange?.from) return 'Período';
    
    const currentPreset = presets.find(p => p.id === currentOption);
    if (currentPreset && currentOption !== 'custom') {
      return currentPreset.shortLabel;
    }
    
    const from = format(selectedRange.from, 'dd/MM');
    const to = selectedRange.to ? format(selectedRange.to, 'dd/MM') : from;
    
    return `${from} - ${to}`;
  };

  const isDateDisabled = (date: Date) => {
    if (!minDate || !maxDate) return true;
    return isBefore(date, minDate) || isAfter(date, maxDate);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`h-8 px-3 text-xs font-medium bg-background/60 backdrop-blur-sm border-border/40 hover:bg-background/80 hover:border-border/60 transition-all duration-200 ${className}`}
        >
          <CalendarIcon className="h-3 w-3 mr-1.5 opacity-60" />
          {formatSelectedPeriod()}
          <ChevronDown className="h-3 w-3 ml-1.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 border-border/40 bg-background/95 backdrop-blur-xl" align="end">
        <div className="p-4">
          {/* Header minimalista */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-foreground/90">Período de análise</h4>
            {minDate && maxDate && (
              <p className="text-xs text-muted-foreground mt-1">
                {format(minDate, 'dd/MM/yyyy')} — {format(maxDate, 'dd/MM/yyyy')} • {availableDates.length} dias
              </p>
            )}
          </div>

          {/* Presets em grid compacto */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {presets.slice(0, 4).map((preset) => {
              const isSelected = currentOption === preset.id;
              const range = preset.getDates(availableDates);
              const isAvailable = preset.id === 'all' || range !== undefined;
              
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  disabled={!isAvailable}
                  className={`
                    relative p-3 rounded-lg text-left transition-all duration-200 border
                    ${isSelected 
                      ? 'bg-primary/10 border-primary/30 text-primary' 
                      : 'bg-background/40 border-border/30 hover:bg-background/60 hover:border-border/50'
                    }
                    ${!isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {isSelected && (
                    <Check className="absolute top-2 right-2 h-3 w-3 text-primary" />
                  )}
                  <div className="text-sm font-medium">{preset.shortLabel}</div>
                  {range && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {format(range.from!, 'dd/MM')} — {format(range.to!, 'dd/MM')}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Separador sutil */}
          <div className="h-px bg-border/30 mb-4" />

          {/* Período personalizado */}
          <div>
            <button
              onClick={() => handlePresetSelect(presets[4])}
              className={`
                w-full p-3 rounded-lg text-left transition-all duration-200 border mb-3
                ${currentOption === 'custom'
                  ? 'bg-primary/10 border-primary/30 text-primary' 
                  : 'bg-background/40 border-border/30 hover:bg-background/60 hover:border-border/50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Personalizado</div>
                  <div className="text-xs text-muted-foreground">Escolher datas</div>
                </div>
                {currentOption === 'custom' && (
                  <Check className="h-3 w-3 text-primary" />
                )}
              </div>
            </button>

            {currentOption === 'custom' && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                <Calendar
                  mode="range"
                  selected={tempRange}
                  onSelect={handleCustomRangeChange}
                  disabled={isDateDisabled}
                  numberOfMonths={1}
                  className="rounded-lg border-border/30"
                  locale={ptBR}
                />
                
                {tempRange?.from && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Período selecionado</div>
                      <div className="text-sm">
                        {format(tempRange.from, 'dd/MM/yyyy')} — {' '}
                        {tempRange.to ? format(tempRange.to, 'dd/MM/yyyy') : format(tempRange.from, 'dd/MM/yyyy')}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={applyCustomRange}
                      className="w-full h-9 text-sm bg-primary hover:bg-primary/90"
                      disabled={!tempRange.from}
                    >
                      Aplicar período
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 