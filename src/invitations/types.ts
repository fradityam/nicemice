// What a couple's data file (src/couples/<slug>.ts) holds. Each template has its own shape,
// since every design has its own slots (Friends has three polaroids, one venue, one bank
// account…); the fields every template shares are in InvitationBase.
//
// Text goes in exactly as it should appear. Templates shrink a line that is too long for its
// slot, but keep to the lengths noted in the example files so nothing ends up tiny.

/** A photo: an import from src/assets (demo pages) or a /couples/<slug>/… URL (couples). */
export type Photo = string;

export interface InvitationBase {
  /** The couple's names as the invitation shows them together, e.g. 'Ratu & Radit'. */
  coupleNames: string;
  /** The word above the guest's name on the cover, e.g. 'Dear' or 'Kepada'. */
  greeting: string;
  /** Shown instead of the guest's name when the link has no ?to=, e.g. 'Bapak/Ibu/Saudara/i'. */
  guestFallback: string;
  /** The song, e.g. '/couples/radit-ratu/music.mp3'; null hides the music button. */
  music: string | null;
  /**
   * Demo pages only: the cover keeps its sample guest name, the RSVP form doesn't send
   * anything, and there is a link back to the nicemice homepage.
   */
  demo?: { sampleGuest: string };
}

/** Wedding day as 'YYYY-MM-DD'. */
export type IsoDate = string;

export interface FriendsInvitation extends InvitationBase {
  template: 'friends';
  date: IsoDate;
  /** The view through the peephole on the cover: the couple peeking in, framed as a circle. */
  coverPhoto: Photo;
  /** The Magna Doodle on the first scene: up to 3 short lines, and who "wrote" it. */
  doodle: { lines: [string, string, string]; signature: string };
  groom: FriendsPerson;
  bride: FriendsPerson;
  /** The three stacked polaroids, top of the stack first; they also open in the gallery. */
  polaroids: [FriendsPolaroid, FriendsPolaroid, FriendsPolaroid];
  /** "Our Love Story": three moments, in order. */
  story: [FriendsStory, FriendsStory, FriendsStory];
  venue: { name: string; /** Google Maps link; when left out, a search for the venue name. */ mapsUrl?: string };
  /** Times as shown, e.g. '10.00 - 11.00 WIB'. Both events are on `date`. */
  ceremony: { time: string };
  reception: { time: string };
  /** The square photo between the RSVP form and the gifts. */
  couplePhoto: Photo;
  bank: { bank: string; number: string; holder: string };
  giftDelivery: { name: string; /** Up to 5 short lines. */ addressLines: string[] };
  closing: { text: string; signature: string };
}

export interface FriendsPerson {
  name: string;
  /** e.g. 'Beloved son of' */
  parentsLabel: string;
  /** e.g. 'Chandra Bong & Monica Ganjar' */
  parents: string;
  photo: Photo;
}

export interface FriendsPolaroid {
  photo: Photo;
  /** A larger copy for the gallery; the polaroid photo itself when left out. */
  large?: Photo;
}

export interface FriendsStory {
  title: string;
  text: string;
}

export type Invitation = FriendsInvitation;
export type TemplateId = Invitation['template'];
