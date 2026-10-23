import { coupleFiles } from '../invitations/couples';
import type { LaLaLandInvitation } from '../invitations/types';

// ─────────────────────────────────────────────────────────────────────────────────────────
// EXAMPLE for the La La Land template. To make a couple's invitation:
//   1. Copy this file to src/couples/<slug>.ts, e.g. src/couples/sebastian-mia.ts
//      → the invitation is nicemice.id/sebastian-mia (lowercase letters, numbers and dashes).
//   2. Put their photos and song in public/couples/<slug>/ and use the same slug below.
//   3. Replace every value. Lengths in [brackets] are what fits the design comfortably;
//      longer text still fits, but is shrunk smaller to do so.
// The invitation itself is in Indonesian; the tagline ("Meet Me Under the Stars"), the quote,
// the intro and the section titles are part of the design and stay the same for everyone.
// Files starting with "_" (like this one) never get a page.
// ─────────────────────────────────────────────────────────────────────────────────────────

const file = coupleFiles('contoh-lalaland'); // ← the slug again

const invitation: LaLaLandInvitation = {
  template: 'lalaland',
  coupleNames: 'Sebastian & Mia', // [about 18 characters] page title, WhatsApp preview, alt texts
  coverNames: ['Sebastian', 'Mia'], // [about 9 characters each] the big script names on the cover, one per line
  greeting: 'Kepada', // the word above the guest's name: 'Kepada', 'Kepada Yth.', …
  guestFallback: 'Bapak/Ibu/Saudara/i', // when the link has no ?to=
  music: file('music.mp3'), // or null for no music

  date: '2027-09-27', // YYYY-MM-DD: cover, "Minggu, 27 September 2027", countdown, WhatsApp preview
  // Portrait, about 9:16. Only the middle shows, in the film-frame window of the opening card
  // (keep faces in the middle). The WhatsApp preview is the centre square of it.
  coverPhoto: file('cover.webp'),
  // shareImage: file('share.jpg'), // optional, 1200×630: a large WhatsApp preview instead of the square thumbnail
  groom: {
    name: 'Sebastian Wilder', // [about 20 characters]
    parentsLabel: 'Putra dari',
    parents: 'Bapak Ari W dan Ibu Dian S', // label + parents on one line [about 45 characters together]
    photo: file('groom.webp'), // square, face in the middle
  },
  bride: {
    name: 'Mia Dolan',
    parentsLabel: 'Putri dari',
    parents: 'Bapak Jerome P dan Ibu Cania C',
    photo: file('bride.webp'), // square
  },
  // 1 to 5 photos, portrait about 4:5. The first is shown first and has no thumbnail; the
  // others get a thumbnail row under it (centred when there are fewer than 4), and the photos
  // change by themselves when there are 2 or more. With 1 photo the row is simply empty.
  // `large` (optional) is a bigger copy for the big frame; `photo` is then the thumbnail.
  gallery: [
    { photo: file('gallery-1.webp') },
    { photo: file('gallery-2.webp') },
    { photo: file('gallery-3.webp') },
    { photo: file('gallery-4.webp') },
    { photo: file('gallery-5.webp') },
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
  venue: {
    name: 'Gedung Serbaguna ABC', // [about 26 characters]
    addressLines: ['Jl. Cempaka No. 18,', 'Kota Bogor, Jawa Barat'], // [1 or 2 lines of about 26 characters]
    mapsUrl: 'https://maps.app.goo.gl/…', // the "Share" link from Google Maps
  },
  // Times as shown [about 17 characters]. The countdown runs to the ceremony's start time.
  ceremony: { time: '08.00 - 11.00 WIB' }, // add label: 'Pemberkatan' (or other) instead of 'Akad Nikah'
  reception: { time: '11.00 - selesai' },
  // Gifts: leave out `bank` or `giftDelivery` to hide that card (the other moves to the middle);
  // leave out both to hide the whole "Tanda Kasih" part.
  bank: { bank: 'Bank BCA', number: '123456789', holder: 'a.n. Mia Dolan' }, // [about 20 characters each]
  giftDelivery: {
    name: 'Sebastian W',
    // [up to 5 lines of about 36 characters]
    addressLines: ['Jl. Anggrek Loka No. 24,', 'RT 005 / RW 002 Kel. Meruya Utara,', 'Kec. Kembangan Jakarta Barat,', 'DKI Jakarta, 11620', 'No. HP: 0812-3456-7890'],
  },
  closing: {
    text: 'Terima kasih telah menjadi bagian dari cerita kami dan berbagi kebahagiaan di hari istimewa ini.', // [about 100 characters]
    signature: 'Sebastian & Mia', // [about 18 characters]
  },
};

export default invitation;
