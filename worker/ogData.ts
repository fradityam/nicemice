// What the build (scripts/sharePreviews.ts) writes to worker/og-data.json for each couple:
// everything the link preview needs, already in the couple's language.

export interface SharePreview {
  /** e.g. 'Ratu & Radit · 27 September 2027' */
  title: string;
  /** The couple's own greeting, e.g. 'Kepada' or 'Dear'. */
  greeting: string;
  /** Shown when the link has no ?to=, e.g. 'Bapak/Ibu/Saudara/i'. */
  guestFallback: string;
  /** What follows "<greeting> <guest>, ", e.g. 'kamu diundang ke pernikahan Ratu & Radit.' */
  invited: string;
  /** Site path of the JPEG, e.g. '/couples/radit-ratu/og.jpg?v=1a2b3c4d'. */
  image: { path: string; width: number; height: number };
}

export type OgData = Record<string, SharePreview>;
