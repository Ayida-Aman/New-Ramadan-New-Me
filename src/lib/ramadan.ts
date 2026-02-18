import {
  differenceInDays,
  isAfter,
  isBefore,
  isWithinInterval,
  parseISO,
  format,
  addDays,
} from "date-fns";

const RAMADAN_DATES: Record<number, { start: string; end: string }> = {
  2026: { start: "2026-02-18", end: "2026-03-19" },
  2027: { start: "2027-02-08", end: "2027-03-09" },
  2028: { start: "2028-01-28", end: "2028-02-26" },
  2029: { start: "2029-01-16", end: "2029-02-14" },
  2030: { start: "2030-01-06", end: "2030-02-04" },
};

export interface RamadanInfo {
  year: number;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  currentDay: number | null;
  daysRemaining: number | null;
  daysUntilStart: number | null;
  isActive: boolean;
  hasEnded: boolean;
  weekNumber: number; // 1-4
}

function getRamadanDatesForYear(year: number): { start: Date; end: Date } {
  const envStart = process.env.NEXT_PUBLIC_RAMADAN_START;
  const envEnd = process.env.NEXT_PUBLIC_RAMADAN_END;

  if (envStart && envEnd) {
    return { start: parseISO(envStart), end: parseISO(envEnd) };
  }

  const dates = RAMADAN_DATES[year];
  if (!dates) {
    const fallback = RAMADAN_DATES[2026];
    return { start: parseISO(fallback.start), end: parseISO(fallback.end) };
  }

  return { start: parseISO(dates.start), end: parseISO(dates.end) };
}

export function getCurrentRamadanYear(): number {
  const now = new Date();
  const currentYear = now.getFullYear();

  for (const year of [currentYear, currentYear + 1]) {
    if (RAMADAN_DATES[year]) {
      const { end } = getRamadanDatesForYear(year);
      if (isBefore(now, addDays(end, 1))) {
        return year;
      }
    }
  }

  return currentYear;
}

export function getRamadanInfo(date: Date = new Date()): RamadanInfo {
  const year = getCurrentRamadanYear();
  const { start, end } = getRamadanDatesForYear(year);
  const totalDays = differenceInDays(end, start) + 1;

  const isActive = isWithinInterval(date, { start, end: addDays(end, 1) });
  const hasEnded = isAfter(date, end);

  let currentDay: number | null = null;
  let daysRemaining: number | null = null;
  let daysUntilStart: number | null = null;

  if (isActive) {
    currentDay = differenceInDays(date, start) + 1;
    daysRemaining = totalDays - currentDay;
  } else if (!hasEnded) {
    daysUntilStart = differenceInDays(start, date);
  }

  const weekNumber = currentDay
    ? Math.min(Math.ceil(currentDay / 7), 4)
    : isBefore(date, start)
      ? 1
      : 4;

  return {
    year,
    startDate: start,
    endDate: end,
    totalDays,
    currentDay,
    daysRemaining,
    daysUntilStart,
    isActive,
    hasEnded,
    weekNumber,
  };
}

export function getRamadanDayDate(dayNumber: number, year?: number): Date {
  const y = year ?? getCurrentRamadanYear();
  const { start } = getRamadanDatesForYear(y);
  return addDays(start, dayNumber - 1);
}

export function formatRamadanDate(date: Date): string {
  return format(date, "EEEE, MMMM d");
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Blessed night";
  if (hour < 12) return "Assalamu alaikum";
  if (hour < 17) return "Good afternoon";
  if (hour < 20) return "Good evening";
  return "Blessed night";
}

export const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type Prayer = (typeof PRAYERS)[number];

export const PRAYER_LABELS: Record<Prayer, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export function distributePagesAcrossPrayers(
  dailyTarget: number
): Record<Prayer, number> {
  const weights = { fajr: 0.3, dhuhr: 0.15, asr: 0.15, maghrib: 0.1, isha: 0.3 };
  const distribution: Record<string, number> = {};
  let remaining = dailyTarget;

  PRAYERS.forEach((prayer, i) => {
    if (i === PRAYERS.length - 1) {
      distribution[prayer] = remaining;
    } else {
      const pages = Math.round(dailyTarget * weights[prayer]);
      distribution[prayer] = pages;
      remaining -= pages;
    }
  });

  return distribution as Record<Prayer, number>;
}

export function calculateDailyTarget(
  totalPages: number,
  ramadanDays: number
): number {
  return Math.ceil(totalPages / ramadanDays);
}
