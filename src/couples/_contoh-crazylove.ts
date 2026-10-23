import { coupleFiles } from '../invitations/couples';
import type { CrazyLoveInvitation } from '../invitations/types';

// ─────────────────────────────────────────────────────────────────────────────────────────
// EXAMPLE for the Crazy Little Thing Called Love template. To make a couple's invitation:
//   1. Copy this file to src/couples/<slug>.ts, e.g. src/couples/ratu-radit.ts
//      → the invitation is nicemice.id/ratu-radit (lowercase letters, numbers and dashes).
//   2. Put their photos and song in public/couples/<slug>/ and use the same slug below.
//   3. Replace every value. Lengths in [brackets] are what fits the design comfortably;
//      longer text still fits, but is shrunk smaller to do so.
// The invitation itself is in Indonesian; the film quote, the intro, the section titles, the
// drawings and "said “I do!”" on the cover are part of the design and stay the same for
// everyone. The cover's button follows `greeting`: 'Dear' keeps it English ("Open the
// Invitation"), any other greeting makes it Indonesian ("Buka Undangan").
// Files starting with "_" (like this one) never get a page.
// ─────────────────────────────────────────────────────────────────────────────────────────

const file = coupleFiles('contoh-crazylove'); // ← the slug again

const invitation: CrazyLoveInvitation = {
  template: 'crazylove',
  coupleNames: 'Ratu & Radit', // [about 14 characters] on the cover polaroid; also page title, WhatsApp preview, gallery
  greeting: 'Kepada', // the word above the guest's name: 'Kepada', 'Kepada Yth.', or 'Dear' for an English button
  guestFallback: 'Bapak/Ibu/Saudara/i', // when the link has no ?to=
  music: file('music.mp3'), // or null for no music

  date: '2027-09-27', // YYYY-MM-DD: date card, countdown, last story moment (if you write it), WhatsApp preview
  coverPhoto: file('cover.webp'), // square, faces in the middle: the cover polaroid and the WhatsApp preview
  // shareImage: file('share.jpg'), // optional, 1200×630: a large WhatsApp preview instead of the square thumbnail

  // salutation: 'Salam Sejahtera', // replaces the Bismillah drawing with this line [about 22 characters]; leave out to keep the Bismillah
  groom: {
    name: 'Raditya M Fadil', // [about 20 characters]
    parentsLabel: 'Putra dari',
    parents: 'Bapak Niskala Saputra dan Ibu Dian Santri', // label + parents on one line under the name [about 55 characters together; longer wraps to 2 lines]
    photo: file('groom.webp'), // square or slightly wide, face in the middle: shown in a wavy frame
  },
  bride: {
    name: 'Ratu Regina',
    parentsLabel: 'Putri dari',
    parents: 'Bapak Harry Tuna dan Ibu Liliana Teratai',
    photo: file('bride.webp'),
  },
  // 1 to 8 photos, all landscape (about 5:3) except the grid's small ones (about square):
  //   1st to 3rd · the three polaroids in the collage at the top (1 or 2 photos sit in the middle)
  //   4th        · the wide photo of the grid lower down
  //   5th to 8th · the four small polaroids under it, two per row (a single one is centred)
  // With 3 photos or fewer there is no grid, and the page closes up. Each photo fills its frame
  // (edges may be cut, keep faces central). Guests can tap any photo to see the section larger.
  // `large` (optional) is a bigger copy for that; `photo` is then the small one.
  gallery: [
    { photo: file('gallery-1.webp') },
    { photo: file('gallery-2.webp') },
    { photo: file('gallery-3.webp') },
    { photo: file('gallery-4.webp') },
    { photo: file('gallery-5.webp') },
    { photo: file('gallery-6.webp') },
    { photo: file('gallery-7.webp') },
    { photo: file('gallery-8.webp') },
  ],
  // "Cerita Kami": 1 to 4 moments, in order, on cards alternating left and right. With fewer the
  // page closes up under the last card. Titles [about 18 characters], usually a date. Texts
  // [about 120 characters]: they wrap by themselves (about 6 lines of 25 characters), or put \n
  // where a line should break.
  story: [
    { title: '1 Juni 2018', text: 'Berawal dari dikenalkan oleh teman kantor. Tak disangka, perkenalan sederhana ini menjadi awal dari perjalanan kami.' },
    { title: '14 Agustus 2018', text: 'Setelah kurang lebih dua bulan PDKT, akhirnya kami memutuskan untuk menjalin hubungan dan memulai cerita sebagai pasangan.' },
    { title: '19 Desember 2025', text: 'Setelah bertahun-tahun melewati suka dan duka bersama, kami mengikat janji untuk melangkah ke tahap berikutnya.' },
    { title: '27 September 2027', text: 'Hari di mana cerita kami berlanjut ke babak baru. Bukan lagi sekadar tentang aku dan kamu, tapi tentang kita dan selamanya.' },
  ],
  // Where the ceremony is. Its card shows "name, first address line" on one line [about 38 characters].
  venue: {
    name: 'Masjid Al-Abror',
    addressLines: ['Jl. Kenanga No. 17'], // 1 or 2 lines [about 22 characters each]
    mapsUrl: 'https://maps.app.goo.gl/…', // the "Share" link from Google Maps; left out, a search for the name and address
  },
  // Times as shown [about 20 characters]. Both events are on `date`; the countdown runs to the ceremony's start.
  ceremony: { time: '08.00 - selesai' }, // add label: 'Pemberkatan' (or other) instead of 'Akad Nikah'
  reception: {
    time: '11.00 - 14.00',
    // Leave out when it's the same place. The reception's card shows "name, first address line"
    // [2 lines of about 28 characters]. "Lokasi Acara" in the journal shows this venue (or the
    // ceremony's): the name [about 30 characters] and every address line.
    venue: {
      name: 'Gedung Serbaguna ABC',
      addressLines: ['Jl. Cempaka No. 18', 'Kota Bogor, Jawa Barat'],
      mapsUrl: 'https://maps.app.goo.gl/…',
      // mapImage: file('map.webp'), // optional: a screenshot of the venue in Google Maps, about 5:4, shown
      //                              // beside the address; left out, the address is centred with a "Lihat Lokasi" button
    },
  },
  // The journal's "Dresscode": the text wraps in a narrow column [about 45 characters, 3 lines of
  // about 16]. The drawing beside it shows batik and kebaya: add illustration: false for a
  // different dress code (the text is then centred). Leave `dresscode` out to hide it all; the
  // venue then moves to the middle of the journal.
  dresscode: { text: 'Tamu diharapkan mengenakan kebaya dan batik' },
  // Gifts: leave out `bank` to show only the address card (it moves up), `giftDelivery` to show
  // only the bank card, or both to hide the whole "Tanda Kasih" part; the closing moves up to follow.
  bank: { bank: 'Bank BCA', number: '123456789', holder: 'a.n. Raditya M Fadil' }, // [bank about 14, number about 13, holder about 24 characters]
  giftDelivery: {
    name: 'Ratu Regina', // [about 14 characters]
    // [up to 5 lines of about 34 characters]
    addressLines: ['Jl. Anggrek Loka No. 24,', 'RT 005 / RW 002 Kel. Meruya Utara,', 'Kec. Kembangan Jakarta Barat,', 'DKI Jakarta, 11620', 'No. HP: 0812-3456-7890'],
  },
  closing: {
    // text: 'Sampai Bertemu di Hari Istimewa Kami', // 'Sampai Jumpa di Hari Bahagia Kami' when left out [about 36 characters]
    signature: 'Ratu & Radit', // the " & " is drawn as a heart [about 14 characters]
  },
};

export default invitation;
