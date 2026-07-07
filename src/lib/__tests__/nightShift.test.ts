import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  isNightShift, getAcreHour, getNightWindow, applyNightShiftLock,
  NIGHT_START, NIGHT_END,
} from '@/lib/nightShift';


/**
 * Rio Branco is UTC-5 (no DST). To hit a specific Acre hour H we build a UTC
 * date with hours = (H + 5) mod 24 for the same calendar day.
 */
const atAcre = (yyyy: number, mm: number, dd: number, h: number, m = 0) =>
  new Date(Date.UTC(yyyy, mm - 1, dd, (h + 5) % 24, m, 0));

describe('nightShift helpers (server-time aware)', () => {
  afterEach(() => vi.useRealTimers());

  it('exposes canonical constants', () => {
    expect(NIGHT_START).toBe('22:00');
    expect(NIGHT_END).toBe('06:00');
  });

  describe('getAcreHour', () => {
    it('converts UTC to America/Rio_Branco (UTC-5)', () => {
      expect(getAcreHour(atAcre(2026, 7, 7, 0))).toBe(0);
      expect(getAcreHour(atAcre(2026, 7, 7, 6))).toBe(6);
      expect(getAcreHour(atAcre(2026, 7, 7, 21, 59))).toBe(21);
      expect(getAcreHour(atAcre(2026, 7, 7, 22))).toBe(22);
      expect(getAcreHour(atAcre(2026, 7, 7, 23, 30))).toBe(23);
    });
  });

  describe('isNightShift', () => {
    it('is FALSE at 06:00 sharp (end of window is exclusive)', () => {
      expect(isNightShift(atAcre(2026, 7, 7, 6, 0))).toBe(false);
    });
    it('is FALSE at 21:59 (before window opens)', () => {
      expect(isNightShift(atAcre(2026, 7, 7, 21, 59))).toBe(false);
    });
    it('is TRUE at 22:00 sharp (window opens)', () => {
      expect(isNightShift(atAcre(2026, 7, 7, 22, 0))).toBe(true);
    });
    it('is TRUE at 23:30', () => {
      expect(isNightShift(atAcre(2026, 7, 7, 23, 30))).toBe(true);
    });
    it('is TRUE at 00:00, 03:15 and 05:59', () => {
      expect(isNightShift(atAcre(2026, 7, 8, 0, 0))).toBe(true);
      expect(isNightShift(atAcre(2026, 7, 8, 3, 15))).toBe(true);
      expect(isNightShift(atAcre(2026, 7, 8, 5, 59))).toBe(true);
    });
    it('is FALSE at midday', () => {
      expect(isNightShift(atAcre(2026, 7, 7, 12, 0))).toBe(false);
    });
    it('uses server time, ignoring device clock offset', () => {
      // Simulate a device with wrong local timezone by mocking Date.now
      const trueNow = atAcre(2026, 7, 7, 23, 0);
      vi.useFakeTimers();
      vi.setSystemTime(trueNow);
      expect(isNightShift()).toBe(true);
    });
  });

  describe('getNightWindow', () => {
    it('returns TODAY 22:00 → TOMORROW 06:00 when called in the evening', () => {
      const w = getNightWindow(atAcre(2026, 7, 7, 22, 30));
      expect(w.startLabel).toMatch(/07\/07\/2026 22:00/);
      expect(w.endLabel).toMatch(/08\/07\/2026 06:00/);
    });
    it('returns YESTERDAY 22:00 → TODAY 06:00 when called after midnight', () => {
      const w = getNightWindow(atAcre(2026, 7, 8, 2, 0));
      expect(w.startLabel).toMatch(/07\/07\/2026 22:00/);
      expect(w.endLabel).toMatch(/08\/07\/2026 06:00/);
    });
    it('returns the NEXT window when called during the day', () => {
      const w = getNightWindow(atAcre(2026, 7, 7, 14, 0));
      expect(w.startLabel).toMatch(/07\/07\/2026 22:00/);
      expect(w.endLabel).toMatch(/08\/07\/2026 06:00/);
    });
    it('window duration is always 8 hours', () => {
      const w = getNightWindow(atAcre(2026, 7, 7, 23, 0));
      expect(w.endsAt.getTime() - w.startsAt.getTime()).toBe(8 * 3600_000);
    });
  });
});
