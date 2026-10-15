import { coupleFiles } from '../invitations/couples';
import type { FriendsInvitation } from '../invitations/types';

// ─────────────────────────────────────────────────────────────────────────────────────────
// EXAMPLE for the Friends template. To make a couple's invitation:
//   1. Copy this file to src/couples/<slug>.ts, e.g. src/couples/radit-ratu.ts
//      → the invitation is nicemice.id/radit-ratu (lowercase letters, numbers and dashes).
//   2. Put their photos and song in public/couples/<slug>/ and use the same slug below.
//   3. Replace every value. Lengths in [brackets] are what fits the design comfortably;
//      longer text still fits, but is shrunk smaller to do so.
// Files starting with "_" (like this one) never get a page.
// ─────────────────────────────────────────────────────────────────────────────────────────

const file = coupleFiles('contoh-friends'); // ← the slug again

const invitation: FriendsInvitation = {
  template: 'friends',
  coupleNames: 'Ratu & Radit', // [about 14 characters] cover, title, gallery
  greeting: 'Dear', // the word above the guest's name: 'Dear', 'Kepada', …
  guestFallback: 'Bapak/Ibu/Saudara/i', // when the link has no ?to=
  music: file('music.mp3'), // or null for no music

  date: '2027-09-27', // YYYY-MM-DD, shown as "27 September 2027"
  coverPhoto: file('cover.webp'), // square, the couple close up: shown as a circle
  doodle: { lines: ['we can have', 'any future', 'you want!'], signature: '-Mike' }, // [3 lines of ~12]
  groom: {
    name: 'Raditya M Fadil', // [about 18 characters]
    parentsLabel: 'Beloved son of',
    parents: 'Chandra Bong & Monica Ganjar', // [about 32 characters]
    photo: file('groom.webp'), // square
  },
  bride: {
    name: 'Ratu Regina',
    parentsLabel: 'Beloved daughter of',
    parents: 'Joseph Tribuana & Rachel Hijau',
    photo: file('bride.webp'), // square
  },
  // Top of the stack first. Landscape photos, about 4:3. `large` (optional) is a bigger
  // copy for the gallery.
  polaroids: [{ photo: file('polaroid-1.webp') }, { photo: file('polaroid-2.webp') }, { photo: file('polaroid-3.webp') }],
  story: [
    // Titles [about 28 characters]; texts [first and last about 200 characters, middle about 120].
    { title: 'The One Where They Met', text: 'It was a rainy Tuesday at a tiny coffee shop that smelled of cinnamon and bad decisions. Ratu knocked over Radit’s americano, and he said it was the best thing that ever happened to him.' },
    { title: 'The One With the First Date', text: 'He took her to a rooftop cinema, forgot the blanket, and she wore his jacket the whole night. She still has it.' },
    { title: 'The One With the Proposal', text: 'Central Perk. Their usual table. He got down on one knee and the barista started slow-clapping. Everyone joined in. It was embarrassingly perfect.' },
  ],
  venue: {
    name: 'Grant House, Jawa Barat', // [about 30 characters]
    mapsUrl: 'https://maps.app.goo.gl/…', // the "Share" link from Google Maps
  },
  ceremony: { time: '10.00 - 11.00 WIB' },
  reception: { time: '13.00 - 16.00 WIB' },
  couplePhoto: file('couple.webp'), // square
  bank: { bank: 'Bank BCA', number: '123456789', holder: 'a.n. Raditya M Fadil' },
  giftDelivery: {
    name: 'Ratu R',
    // [up to 5 lines of about 40 characters]
    addressLines: ['Jl. Anggrek Loka No. 24,', 'RT 005 / RW 002 Kel. Meruya Utara,', 'Kec. Kembangan Jakarta Barat,', 'DKI Jakarta, 11620', 'Phone: 0812-3456-7890'],
  },
  closing: {
    text: 'Thank you for being part of our story and for celebrating this special moment with us. Having our favorite people by our side makes this day even more meaningful. We can’t wait to laugh, dance, and make more memories together.', // [about 230 characters]
    signature: 'Ratu & Radit',
  },
};

export default invitation;
