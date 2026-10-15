import type { IsoDate } from './types';

/** 'YYYY-MM-DD' as that calendar day in the guest's own time zone (not UTC midnight). */
export function parseIsoDate(iso: IsoDate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Demo pages: a wedding `days` from today, so the dates in the design stay believable. */
export function isoDateFromToday(days: number): IsoDate {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
