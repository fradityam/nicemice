import { coupleFiles } from '../invitations/couples';
import type { NotebookInvitation } from '../invitations/types';

// ─────────────────────────────────────────────────────────────────────────────────────────
// EXAMPLE for The Notebook template. To make a couple's invitation:
//   1. Copy this file to src/couples/<slug>.ts, e.g. src/couples/noah-allie.ts
//      → the invitation is nicemice.id/noah-allie (lowercase letters, numbers and dashes).
//   2. Put their photos and song in public/couples/<slug>/ and use the same slug below.
//   3. Replace every value. Lengths in [brackets] are what fits the design comfortably;
//      longer text still fits, but is shrunk smaller to do so.
// The invitation itself is in Indonesian; the film quote, the intro and the section titles are
// part of the design and stay the same for everyone. The cover follows `greeting`: 'Dear'
// keeps it English ("You’re invited to the wedding of", "Sunday, 27 September 2027"), any
// other greeting makes it Indonesian ("Kami mengundang Anda ke pernikahan", "Minggu, 27
// September 2027").
// Files starting with "_" (like this one) never get a page.
// ─────────────────────────────────────────────────────────────────────────────────────────

const file = coupleFiles('contoh-notebook'); // ← the slug again

// The design has no spot for a cover photo: `coverPhoto` is only the WhatsApp link preview,
// which shows the centre square of it. So there's no need for an extra photo: reuse the gallery
// photo whose faces are nearest the middle (here the first), as below.
const gallery1 = file('gallery-1.webp');

const invitation: NotebookInvitation = {
  template: 'notebook',
  coupleNames: 'Noah & Allie', // [about 18 characters] page title, WhatsApp preview, gallery
  coverNames: ['Noah', 'Allie'], // [about 9 characters each] the big names on the cover, above and below the "&"
  greeting: 'Kepada', // the word above the guest's name: 'Kepada', 'Kepada Yth.', or 'Dear' for an English cover
  guestFallback: 'Bapak/Ibu/Saudara/i', // when the link has no ?to=
  music: file('music.mp3'), // or null for no music

  date: '2027-09-27', // YYYY-MM-DD: cover, both event cards, WhatsApp preview
  coverPhoto: gallery1, // WhatsApp preview only (see above); any photo works, e.g. file('cover.webp')
  // shareImage: file('share.jpg'), // optional, 1200×630: a large WhatsApp preview instead of the square thumbnail

  // salutation: 'Salam Sejahtera', // the line above the intro; 'Assalamu’alaikum Wr. Wb.' when left out [about 30 characters]
  groom: {
    name: 'Noah Calhoun, S.T.', // [about 18 characters]
    parentsLabel: 'Putra dari',
    parents: 'Bapak Frank Calhoun & Ibu Sarah Calhoun', // label + parents wrap in a narrow column [about 50 characters together, 3 short lines]
    photo: file('groom.webp'), // portrait, about 2:3, face in the middle: shown in an oval
  },
  bride: {
    name: 'Allie Hamilton',
    parentsLabel: 'Putri dari',
    parents: 'Bapak John Hamilton & Ibu Anne Hamilton',
    photo: file('bride.webp'), // portrait, about 2:3
  },
  // 1 to 4 photos for the collage, each in its own frame shape, so their shape matters:
  //   1st tall (portrait, about 2:3) · 2nd and 3rd square · 4th wide (landscape, about 3:2).
  // With fewer photos the frames used are centred: 3 = tall + two squares, 2 = tall + square,
  // 1 = the tall frame alone. Each photo fills its frame (edges may be cut, keep faces central).
  // `large` (optional) is a bigger copy for when a guest taps a photo; `photo` is then the small one.
  gallery: [
    { photo: gallery1 },
    { photo: file('gallery-2.webp') },
    { photo: file('gallery-3.webp') },
    { photo: file('gallery-4.webp') },
  ],
  // "Cerita Kami": 1 to 4 moments, in order, alternating left and right of the timeline. With
  // fewer than 4 the timeline ends after the last one (the space under it stays empty).
  // Titles [about 18 characters], usually a date. Texts [about 130 characters]: they wrap by
  // themselves, or put \n where a line should break (5 lines of about 28 characters fit best).
  story: [
    { title: '1 Juni 2018', text: 'Berawal dari dikenalkan oleh teman kantor. Tak disangka, perkenalan sederhana ini menjadi awal dari perjalanan kami.' },
    { title: '14 Agustus 2018', text: 'Setelah kurang lebih dua bulan PDKT, akhirnya kami memutuskan untuk menjalin hubungan dan memulai cerita sebagai pasangan.' },
    { title: '19 Desember 2025', text: 'Setelah bertahun-tahun melewati suka dan duka bersama, kami mengikat janji untuk melangkah ke tahap berikutnya.' },
    { title: '27 September 2027', text: 'Hari di mana cerita kami berlanjut ke babak baru. Bukan lagi sekadar tentang aku dan kamu, tapi tentang kita dan selamanya.' },
  ],
  // Where the ceremony is [about 28 characters]; the reception is there too unless it has its own `venue`.
  venue: {
    name: 'Masjid Istiqlal Jakarta',
    mapsUrl: 'https://maps.app.goo.gl/…', // the "Share" link from Google Maps; left out, a search for the name
  },
  // Times as shown [about 20 characters]. Both events are on `date`.
  ceremony: { time: '08.00 - 10.00 WIB' }, // add label: 'Pemberkatan' (or other) instead of 'Akad Nikah'
  reception: {
    time: '11.00 - 14.00 WIB',
    venue: { name: 'Hotel Mulia', mapsUrl: 'https://maps.app.goo.gl/…' }, // leave out when it's the same place
  },
  // Gifts: leave out `bank` to show only "Bingkisan Fisik" (it moves up), `giftDelivery` to show
  // only the bank card, or both to hide the whole part; the flower arch moves up to follow.
  bank: { bank: 'Bank BCA', number: '123456789', holder: 'a.n. Noah Calhoun' }, // [bank about 16, number about 14, holder about 40 characters]
  giftDelivery: {
    name: 'Allie H.', // [about 16 characters]
    // [up to 5 lines of about 38 characters]
    addressLines: ['Jl. Anggrek Loka No. 24,', 'RT 005 / RW 002 Kel. Meruya Utara,', 'Kec. Kembangan Jakarta Barat,', 'DKI Jakarta, 11620', 'No. HP: 0812-3456-7890'],
  },
  closing: {
    // text: 'Sampai Bertemu di\nHari Istimewa Kami', // on the flower arch; 'Sampai Jumpa di Hari Bahagia Kami' when left out [2 lines of about 17 characters, \n between them]
    signature: 'Noah & Allie', // [about 18 characters]
  },
};

export default invitation;
