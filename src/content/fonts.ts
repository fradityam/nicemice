import type { TemplateId } from '../invitations/types';

// Google Fonts each page needs, so a page loads only its own: the homepage used to wait for
// every template's fonts. One stylesheet per page, written into the HTML by the Worker
// (worker/index.ts) for the page being opened, and added by the app (src/loadFonts.ts) when
// moving to another page inside it. index.html carries the homepage's.
//
// Every template also gets Inter: it's the default font (`font-sans` on <body>), used by
// text that doesn't set its own, like the "← nicemice" link on the demos. The Friends
// title font (Gabriel Weiss) is a local file, loaded by friends.css.

export type FontSet = 'home' | TemplateId | 'other';

/** Family specs exactly as Google Fonts' css2 API takes them. */
const FAMILY = {
  inter: 'Inter:wght@300;400;500;600;700',
  raleway: 'Raleway:wght@400;500;600;700',
  dmSans: 'DM+Sans:wght@400;500;600;700',
  dmMono: 'DM+Mono:wght@400;500',
  libreCaslon: 'Libre+Caslon+Text:ital@0;1',
  fraunces: 'Fraunces:opsz,wght,SOFT,WONK@9..144,400..700,0..100,0..1',
  fasthand: 'Fasthand',
  federo: 'Federo',
  pompiere: 'Pompiere',
  yesevaOne: 'Yeseva+One',
  laBelleAurore: 'La+Belle+Aurore',
  openSans: 'Open+Sans',
  nanumPen: 'Nanum+Pen+Script',
  josefinSans: 'Josefin+Sans:wght@300;400',
  josefinSlab: 'Josefin+Slab:wght@400;500;600;700',
  cormorant: 'Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400',
  courierPrime: 'Courier+Prime:ital,wght@0,400;0,700;1,400',
  lora: 'Lora:ital,wght@0,400;0,500;0,600;1,400',
  poppins: 'Poppins:wght@300;400;500;600;700',
  playfair: 'Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600;1,700',
  crimson: 'Crimson+Text:ital,wght@0,400;0,600;1,400',
  montserrat: 'Montserrat:wght@300;400;500;600',
  bigShoulders: 'Big+Shoulders+Display:wght@700',
};

const FONTS: Record<FontSet, string[]> = {
  home: [FAMILY.dmSans, FAMILY.dmMono, FAMILY.libreCaslon],
  friends: [FAMILY.inter, FAMILY.raleway, FAMILY.fraunces],
  lalaland: [FAMILY.inter, FAMILY.raleway, FAMILY.fasthand, FAMILY.federo, FAMILY.pompiere],
  notebook: [FAMILY.inter, FAMILY.raleway, FAMILY.yesevaOne, FAMILY.laBelleAurore, FAMILY.openSans],
  crazylove: [FAMILY.inter, FAMILY.raleway, FAMILY.nanumPen, FAMILY.josefinSans, FAMILY.josefinSlab],
  // The "not found" and "Segera Hadir" pages (Inter, Cormorant) and the templates hidden from
  // the catalog, which use the rest.
  other: [
    FAMILY.inter, FAMILY.cormorant, FAMILY.playfair, FAMILY.poppins, FAMILY.courierPrime, FAMILY.lora,
    FAMILY.crimson, FAMILY.montserrat, FAMILY.bigShoulders, FAMILY.raleway,
  ],
};

/** The Google Fonts stylesheet for a page. */
export const fontsHref = (set: FontSet) => `https://fonts.googleapis.com/css2?${FONTS[set].map((f) => `family=${f}`).join('&')}&display=swap`;
