// What a couple's data file (src/couples/<slug>.ts) holds. Each template has its own shape,
// since every design has its own slots (Friends has three polaroids, one venue, one bank
// account…); the fields every template shares are in InvitationBase.
//
// Text goes in exactly as it should appear. Templates shrink a line that is too long for its
// slot, but keep to the lengths noted in the example files so nothing ends up tiny.

/** A photo: an import from src/assets (demo pages) or a /couples/<slug>/… URL (couples). */
export type Photo = string;

/** Wedding day as 'YYYY-MM-DD'. */
export type IsoDate = string;

export interface InvitationBase {
  /** The couple's names as the invitation shows them together, e.g. 'Ratu & Radit'. */
  coupleNames: string;
  /** The word above the guest's name on the cover, e.g. 'Dear' or 'Kepada'. */
  greeting: string;
  /** Shown instead of the guest's name when the link has no ?to=, e.g. 'Bapak/Ibu/Saudara/i'. */
  guestFallback: string;
  /** The song, e.g. '/couples/radit-ratu/music.mp3'; null hides the music button. */
  music: string | null;
  /** The wedding day: shown in the invitation and in the WhatsApp link preview. */
  date: IsoDate;
  /**
   * The couple's main photo, which each design places in its own way (Friends: through the
   * peephole on the cover; La La Land: in the opening card; The Notebook: nowhere, it is only
   * the preview). Also the WhatsApp link preview, cropped to a square from the centre.
   */
  coverPhoto: Photo;
  /**
   * Optional: a 1200×630 photo for a large WhatsApp link preview. Without it the preview
   * shows the cover photo as a small square thumbnail.
   */
  shareImage?: Photo;
  /**
   * Demo pages only: the cover keeps its sample guest name, the wishes band shows the sample
   * wishes (a visitor's own goes on top, on their screen only), the RSVP form doesn't send
   * anything, and there is a link back to the nicemice homepage.
   */
  demo?: { sampleGuest: string; sampleWishes: SampleWish[] };
}

/** A made-up wish for a demo's wishes band, sent `minutesAgo` before the page was opened. */
export interface SampleWish {
  name: string;
  message: string;
  minutesAgo: number;
}

export interface Person {
  name: string;
  /** e.g. 'Beloved son of' or 'Putra dari' */
  parentsLabel: string;
  /** e.g. 'Chandra Bong & Monica Ganjar' */
  parents: string;
  photo: Photo;
}

export interface GalleryPhoto {
  photo: Photo;
  /** A larger copy for the gallery; the photo itself when left out. */
  large?: Photo;
}

export interface StoryMoment {
  title: string;
  text: string;
}

export interface BankAccount {
  bank: string;
  number: string;
  holder: string;
}

export interface GiftDelivery {
  name: string;
  /** Up to 5 short lines. */
  addressLines: string[];
}

export interface FriendsInvitation extends InvitationBase {
  template: 'friends';
  /** The Magna Doodle on the first scene: up to 3 short lines, and who "wrote" it. */
  doodle: { lines: [string, string, string]; signature: string };
  groom: Person;
  bride: Person;
  /** The three stacked polaroids, top of the stack first; they also open in the gallery. */
  polaroids: [GalleryPhoto, GalleryPhoto, GalleryPhoto];
  /** "Our Love Story": three moments, in order. */
  story: [StoryMoment, StoryMoment, StoryMoment];
  venue: { name: string; /** Google Maps link; when left out, a search for the venue name. */ mapsUrl?: string };
  /** Times as shown, e.g. '10.00 - 11.00 WIB'. Both events are on `date`. */
  ceremony: { time: string };
  reception: { time: string };
  /** The square photo between the RSVP form and the gifts. */
  couplePhoto: Photo;
  /** Leave out to hide "Bank transfer" (with both gifts left out, the whole "Gifting" part). */
  bank?: BankAccount;
  /** Leave out to hide "Gift Delivery". */
  giftDelivery?: GiftDelivery;
  closing: { text: string; signature: string };
}

export interface LaLaLandInvitation extends InvitationBase {
  template: 'lalaland';
  /** The two names in large script on the cover, one per line, e.g. ['Sebastian', 'Mia']. */
  coverNames: [string, string];
  groom: Person;
  bride: Person;
  /**
   * The pre-wedding gallery, 1 to 5 photos (more are left out). The first is shown first;
   * the others also get a thumbnail row under it.
   */
  gallery: [GalleryPhoto, ...GalleryPhoto[]];
  /**
   * "Cerita Kami": 1 to 4 moments in order (more are left out), down the timeline. `title`
   * is the bold first line, usually a date. A line break (\n) in `text` breaks the line there.
   */
  story: [StoryMoment, ...StoryMoment[]];
  venue: {
    name: string;
    /** 1 or 2 short lines under the name. */
    addressLines: string[];
    /** Google Maps link; when left out, a search for the venue name and address. */
    mapsUrl?: string;
  };
  /**
   * Times as shown, e.g. '08.00 - 11.00'. Both events are on `date`; the countdown runs to
   * the ceremony's start time. `label` is 'Akad Nikah' unless given, e.g. 'Pemberkatan'.
   */
  ceremony: { time: string; label?: string };
  reception: { time: string };
  /** Leave out to hide the bank card (with both gifts left out, the whole "Tanda Kasih" part). */
  bank?: BankAccount;
  /** Leave out to hide the gift address card. */
  giftDelivery?: GiftDelivery;
  closing: { text: string; signature: string };
}

export interface Venue {
  name: string;
  /** Google Maps link; when left out, a search for the venue name. */
  mapsUrl?: string;
}

export interface NotebookInvitation extends InvitationBase {
  template: 'notebook';
  /** The two names in large letters on the cover, one above and one below the "&", e.g. ['Noah', 'Allie']. */
  coverNames: [string, string];
  /**
   * The line above the intro, e.g. 'Salam Sejahtera'; 'Assalamu’alaikum Wr. Wb.' unless given.
   * (The cover follows `greeting` instead: English with 'Dear', Indonesian with 'Kepada'.)
   */
  salutation?: string;
  groom: Person;
  bride: Person;
  /**
   * The photo collage, 1 to 4 photos (more are left out), each in its own frame: the first
   * tall, the second and third square, the fourth wide. Fewer photos are centred.
   */
  gallery: [GalleryPhoto, ...GalleryPhoto[]];
  /**
   * "Cerita Kami": 1 to 4 moments in order (more are left out), down the timeline. `title`
   * is the bold first line, usually a date. A line break (\n) in `text` breaks the line there.
   */
  story: [StoryMoment, ...StoryMoment[]];
  /** Where the ceremony is; also the reception's, unless `reception.venue` says otherwise. */
  venue: Venue;
  /** Times as shown, e.g. '10.00 WIB'. Both events are on `date`. `label` is 'Akad Nikah' unless given, e.g. 'Pemberkatan'. */
  ceremony: { time: string; label?: string };
  reception: { time: string; venue?: Venue };
  /** Leave out to hide the bank card (with both gifts left out, the whole "Tanda Kasih" part). */
  bank?: BankAccount;
  /** Leave out to hide "Bingkisan Fisik" and its address card. */
  giftDelivery?: GiftDelivery;
  /** On the flower arch: `text` is 'Sampai Jumpa di Hari Bahagia Kami' unless given. */
  closing: { text?: string; signature: string };
}

export type Invitation = FriendsInvitation | LaLaLandInvitation | NotebookInvitation;
export type TemplateId = Invitation['template'];
