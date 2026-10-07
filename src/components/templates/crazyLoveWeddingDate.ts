// Demo template: the wedding is always 30 days after the visitor opens the page, so the
// dates in the design stay believable. The countdown runs to the Akad (08.00).
export const WEDDING_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  d.setHours(8, 0, 0, 0);
  return d;
})();

/** Date card and last Cerita Kami entry, in the design's style: "27 September 2026" */
export const weddingDateId = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(WEDDING_DATE);
