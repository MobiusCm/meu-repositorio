"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  className?: string;
  onDateChange?: (range: DateRange | undefined) => void;
  minDate?: Date | null;
  maxDate?: Date | null;
  defaultValue?: DateRange;
}

export function DatePickerWithRange({ 
  className, 
  onDateChange, 
  minDate, 
  maxDate, 
  defaultValue
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(defaultValue);

  // Atualizar quando defaultValue mudar
  React.useEffect(() => {
    if (defaultValue) {
      setDate(defaultValue);
    }
  }, [defaultValue]);

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  // Criar datas de disable baseadas no minDate e maxDate
  const disabledDays = React.useMemo(() => {
    const disabled: any[] = [];
    
    if (minDate) {
      disabled.push({ before: minDate });
    }
    
    if (maxDate) {
      disabled.push({ after: maxDate });
    }
    
    return disabled;
  }, [minDate, maxDate]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} -{" "}
                  {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Selecione o período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={maxDate || new Date()}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            disabled={disabledDays}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
