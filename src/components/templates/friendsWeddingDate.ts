// Demo template: the wedding is always 30 days after the visitor opens the page, so the
// dates in the design stay believable.
const WEDDING_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
})();

/** Title, Ceremony and Reception, in the design's style: "27 September 2027" */
export const weddingDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(WEDDING_DATE);
