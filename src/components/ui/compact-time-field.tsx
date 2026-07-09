import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompactTimeFieldProps {
  id?: string;
  value: string; // "HH:MM"
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  step?: number; // minute granularity, default 5
}

/**
 * Professional compact HH:MM field.
 * - Two native <select> segments (native = perfect mobile UX, no circular wheel).
 * - Tabular mono digits, dark tactical style.
 * - Fits snugly on very small screens (< 320px).
 */
export function CompactTimeField({
  id,
  value,
  onChange,
  className,
  disabled,
  step = 5,
}: CompactTimeFieldProps) {
  const [h, m] = React.useMemo(() => {
    const [hh = "00", mm = "00"] = (value || "00:00").split(":");
    return [hh.padStart(2, "0"), mm.padStart(2, "0")];
  }, [value]);

  const hours = React.useMemo(
    () => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")),
    []
  );
  const minutes = React.useMemo(() => {
    const s = Math.max(1, Math.min(30, step));
    return Array.from({ length: Math.ceil(60 / s) }, (_, i) =>
      (i * s).toString().padStart(2, "0")
    );
  }, [step]);

  // Ensure current minute is selectable even if not on step grid
  const minuteOptions = minutes.includes(m) ? minutes : [...minutes, m].sort();

  const setHour = (nh: string) => onChange(`${nh}:${m}`);
  const setMinute = (nm: string) => onChange(`${h}:${nm}`);

  const selectCls =
    "appearance-none bg-transparent text-slate-100 font-mono tabular-nums text-base font-semibold text-center px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400/60 rounded";

  return (
    <div
      id={id}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 min-h-11 w-full",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
    >
      <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" aria-hidden />
      <select
        aria-label="Hora"
        value={h}
        onChange={(e) => setHour(e.target.value)}
        disabled={disabled}
        className={selectCls}
      >
        {hours.map((hh) => (
          <option key={hh} value={hh} className="bg-slate-900 text-slate-100">
            {hh}
          </option>
        ))}
      </select>
      <span className="text-amber-400 font-mono font-bold">:</span>
      <select
        aria-label="Minuto"
        value={m}
        onChange={(e) => setMinute(e.target.value)}
        disabled={disabled}
        className={selectCls}
      >
        {minuteOptions.map((mm) => (
          <option key={mm} value={mm} className="bg-slate-900 text-slate-100">
            {mm}
          </option>
        ))}
      </select>
    </div>
  );
}
