import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ClockProps {
  size?: number;
  className?: string;
}

export function ThemedAnalogClock({ size = 120, className = '' }: ClockProps) {
  const { resolvedTheme } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  // Theme-specific clock styles
  const getClockStyles = () => {
    switch (resolvedTheme) {
      case 'tactical':
        return {
          face: 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900',
          border: 'border-4 border-amber-500/60',
          hourHand: 'bg-amber-400',
          minuteHand: 'bg-amber-300',
          secondHand: 'bg-red-500',
          center: 'bg-amber-500',
          markers: 'bg-amber-400/80',
          glow: 'shadow-[0_0_30px_rgba(251,191,36,0.3)]',
          innerRing: 'border-amber-500/30',
        };
      case 'cyber':
        return {
          face: 'bg-gradient-to-br from-violet-950 via-purple-900 to-cyan-950',
          border: 'border-4 border-cyan-400/60',
          hourHand: 'bg-gradient-to-t from-cyan-400 to-purple-400',
          minuteHand: 'bg-gradient-to-t from-purple-400 to-cyan-400',
          secondHand: 'bg-cyan-400',
          center: 'bg-gradient-to-br from-cyan-400 to-purple-500',
          markers: 'bg-cyan-400/80',
          glow: 'shadow-[0_0_40px_rgba(6,182,212,0.4),0_0_20px_rgba(168,85,247,0.3)]',
          innerRing: 'border-cyan-400/30',
        };
      case 'crimson':
        return {
          face: 'bg-gradient-to-br from-red-950 via-rose-900 to-red-950',
          border: 'border-4 border-red-500/60',
          hourHand: 'bg-red-400',
          minuteHand: 'bg-orange-400',
          secondHand: 'bg-yellow-400',
          center: 'bg-gradient-to-br from-red-500 to-orange-500',
          markers: 'bg-red-400/80',
          glow: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]',
          innerRing: 'border-red-500/30',
        };
      case 'arctic':
        return {
          face: 'bg-gradient-to-br from-slate-100 via-sky-50 to-cyan-100',
          border: 'border-4 border-sky-400/60',
          hourHand: 'bg-sky-600',
          minuteHand: 'bg-sky-500',
          secondHand: 'bg-cyan-500',
          center: 'bg-gradient-to-br from-sky-500 to-cyan-500',
          markers: 'bg-sky-600/80',
          glow: 'shadow-[0_0_30px_rgba(56,189,248,0.3)]',
          innerRing: 'border-sky-400/40',
        };
      case 'sovereign':
        return {
          face: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900',
          border: 'border-4 border-amber-400/60',
          hourHand: 'bg-gradient-to-t from-amber-500 to-yellow-300',
          minuteHand: 'bg-gradient-to-t from-amber-400 to-yellow-200',
          secondHand: 'bg-rose-400',
          center: 'bg-gradient-to-br from-amber-400 to-yellow-500',
          markers: 'bg-amber-400/80',
          glow: 'shadow-[0_0_40px_rgba(251,191,36,0.3),0_0_20px_rgba(99,102,241,0.2)]',
          innerRing: 'border-amber-400/30',
        };
      case 'nexus':
        return {
          face: 'bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950',
          border: 'border-4 border-teal-400/60',
          hourHand: 'bg-gradient-to-t from-teal-400 to-emerald-300',
          minuteHand: 'bg-gradient-to-t from-emerald-400 to-teal-300',
          secondHand: 'bg-cyan-400',
          center: 'bg-gradient-to-br from-teal-400 to-emerald-500',
          markers: 'bg-teal-400/80',
          glow: 'shadow-[0_0_40px_rgba(20,184,166,0.4),0_0_20px_rgba(16,185,129,0.3)]',
          innerRing: 'border-teal-400/30',
        };
      default:
        return {
          face: 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900',
          border: 'border-4 border-primary/60',
          hourHand: 'bg-primary',
          minuteHand: 'bg-primary/80',
          secondHand: 'bg-destructive',
          center: 'bg-primary',
          markers: 'bg-primary/80',
          glow: 'shadow-[0_0_30px_hsl(var(--primary)/0.3)]',
          innerRing: 'border-primary/30',
        };
    }
  };

  const styles = getClockStyles();

  // Generate hour markers
  const hourMarkers = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30 - 90;
    const isMainMarker = i % 3 === 0;
    const markerLength = isMainMarker ? 10 : 6;
    const markerWidth = isMainMarker ? 3 : 2;
    const distance = size / 2 - 12;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;
    
    return (
      <div
        key={i}
        className={`absolute ${styles.markers} rounded-full`}
        style={{
          width: markerWidth,
          height: markerLength,
          left: size / 2 + x - markerWidth / 2,
          top: size / 2 + y - markerLength / 2,
          transform: `rotate(${angle + 90}deg)`,
        }}
      />
    );
  });

  // Generate minute markers (small dots)
  const minuteMarkers = Array.from({ length: 60 }, (_, i) => {
    if (i % 5 === 0) return null;
    const angle = i * 6 - 90;
    const distance = size / 2 - 8;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;
    
    return (
      <div
        key={`min-${i}`}
        className={`absolute ${styles.markers} opacity-40 rounded-full`}
        style={{
          width: 2,
          height: 2,
          left: size / 2 + x - 1,
          top: size / 2 + y - 1,
        }}
      />
    );
  });

  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer glow ring */}
      <div 
        className={`absolute inset-0 rounded-full ${styles.glow} animate-pulse`}
        style={{ animationDuration: '3s' }}
      />
      
      {/* Clock face */}
      <div 
        className={`absolute inset-0 rounded-full ${styles.face} ${styles.border}`}
      >
        {/* Inner decorative ring */}
        <div 
          className={`absolute inset-3 rounded-full border-2 ${styles.innerRing}`}
        />
        
        {/* Hour markers */}
        {hourMarkers}
        
        {/* Minute markers */}
        {minuteMarkers}
        
        {/* Hour hand */}
        <div
          className={`absolute ${styles.hourHand} rounded-full origin-bottom`}
          style={{
            width: 6,
            height: size * 0.25,
            left: size / 2 - 3,
            top: size / 2 - size * 0.25,
            transform: `rotate(${hourDeg}deg)`,
            transformOrigin: 'center bottom',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        />
        
        {/* Minute hand */}
        <div
          className={`absolute ${styles.minuteHand} rounded-full origin-bottom`}
          style={{
            width: 4,
            height: size * 0.35,
            left: size / 2 - 2,
            top: size / 2 - size * 0.35,
            transform: `rotate(${minuteDeg}deg)`,
            transformOrigin: 'center bottom',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        />
        
        {/* Second hand */}
        <div
          className={`absolute ${styles.secondHand} origin-bottom transition-none`}
          style={{
            width: 2,
            height: size * 0.4,
            left: size / 2 - 1,
            top: size / 2 - size * 0.4,
            transform: `rotate(${secondDeg}deg)`,
            transformOrigin: 'center bottom',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}
        />
        
        {/* Center cap */}
        <div
          className={`absolute ${styles.center} rounded-full`}
          style={{
            width: 14,
            height: 14,
            left: size / 2 - 7,
            top: size / 2 - 7,
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </div>
  );
}
