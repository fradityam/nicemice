// Demo template: the wedding is always 30 days after the visitor opens the page (08:00,
// when the Akad starts), so the countdown never reaches zero.
export const WEDDING_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  d.setHours(8, 0, 0, 0);
  return d;
})();

const format = (locale: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale, options).format(WEDDING_DATE);

/** e.g. "23 Agustus 2026" */
export const weddingDateId = format('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
/** e.g. "Minggu, 23 Agustus 2026" */
export const weddingDateIdLong = format('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
/** e.g. "23 August 2026" */
export const weddingDateEn = format('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
