// Demo template: the wedding is always 30 days after the visitor opens the page, so the
// dates in the design stay believable.
const WEDDING_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
})();

const part = (locale: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale, options).format(WEDDING_DATE);

/** Cover, in the design's English style: "Sunday, 16 August 2026" */
export const weddingDateCover = `${part('en-GB', { weekday: 'long' })}, ${part('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
/** Akad / Resepsi: "Minggu, 16 Agustus 2026" */
export const weddingDateIdLong = part('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
/** Last Cerita Kami entry: "16 Agustus 2026" */
export const weddingDateId = part('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
