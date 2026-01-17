import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
  addMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ShiftMiniCalendarShift = {
  id: string;
  shift_date: string; // yyyy-MM-dd
};

interface ShiftMiniCalendarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  shifts: ShiftMiniCalendarShift[];
  onDayWithShiftClick: (shiftId: string) => void;
  className?: string;
}

export function ShiftMiniCalendar({
  month,
  onMonthChange,
  shifts,
  onDayWithShiftClick,
  className,
}: ShiftMiniCalendarProps) {
  const shiftByDate = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of shifts) map.set(s.shift_date, s.id);
    return map;
  }, [shifts]);

  const monthStart = startOfMonth(month);
  const gridStart = startOfWeek(monthStart, { locale: ptBR });
  const gridEnd = endOfWeek(endOfMonth(month), { locale: ptBR });

  const days = useMemo(() => {
    const out: Date[] = [];
    let d = gridStart;
    while (d <= gridEnd) {
      out.push(d);
      d = addDays(d, 1);
    }
    return out;
  }, [gridStart, gridEnd]);

  const weekDays = useMemo(() => {
    // 7 labels starting from gridStart weekday
    const labels: string[] = [];
    for (let i = 0; i < 7; i++) {
      labels.push(format(addDays(gridStart, i), "EEEEE", { locale: ptBR }).toUpperCase());
    }
    return labels;
  }, [gridStart]);

  const handlePrev = () => onMonthChange(subMonths(month, 1));
  const handleNext = () => onMonthChange(addMonths(month, 1));

  return (
    <div className={cn("rounded-lg bg-background/0", className)}>
      <div className="flex items-center justify-between px-1 pb-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          className="h-8 w-8"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-xs font-semibold tracking-wide text-foreground/90">
          {format(month, "MMMM yyyy", { locale: ptBR }).toUpperCase()}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="h-8 w-8"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 px-1">
        {weekDays.map((w) => (
          <div key={w} className="text-center text-[10px] font-semibold text-muted-foreground">
            {w}
          </div>
        ))}

        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const shiftId = shiftByDate.get(key);
          const inMonth = isSameMonth(d, monthStart);
          const today = isToday(d);

          return (
            <button
              key={key}
              type="button"
              disabled={!shiftId}
              onClick={() => shiftId && onDayWithShiftClick(shiftId)}
              className={cn(
                "h-7 w-full rounded-md text-[11px] font-semibold tabular-nums transition-colors",
                inMonth ? "text-foreground" : "text-muted-foreground/40",
                today && "ring-1 ring-primary/50",
                shiftId
                  ? "bg-primary/15 text-primary hover:bg-primary/20"
                  : "bg-muted/20 hover:bg-muted/30",
                !shiftId && "cursor-default",
              )}
              aria-label={`Dia ${format(d, "dd/MM", { locale: ptBR })}${shiftId ? " (plantão)" : ""}`}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
