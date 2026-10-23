import couplePhotos from '../../assets/images/notebook/couple-photos.webp';
import prewed1 from '../../assets/images/notebook/prewed-1.webp';
import prewed1Large from '../../assets/images/notebook/prewed-1-lg.webp';
import prewed2 from '../../assets/images/notebook/prewed-2.webp';
import prewed2Large from '../../assets/images/notebook/prewed-2-lg.webp';
import prewed3 from '../../assets/images/notebook/prewed-3.webp';
import prewed3Large from '../../assets/images/notebook/prewed-3-lg.webp';
import prewed4 from '../../assets/images/notebook/prewed-4.webp';
import prewed4Large from '../../assets/images/notebook/prewed-4-lg.webp';
import { formatIsoDate, isoDateFromToday } from '../dates';
import type { NotebookInvitation } from '../types';

const date = isoDateFromToday(30);

/** nicemice.id/template/notebook: The Notebook design with its Figma sample content. */
export const notebookDemo: NotebookInvitation = {
  template: 'notebook',
  coupleNames: 'Noah & Allie',
  greeting: 'Dear',
  guestFallback: 'Bapak/Ibu/Saudara/i',
  music: `${import.meta.env.BASE_URL}notebook-music.mp3`,
  demo: {
    sampleGuest: 'Nadia Kusuma',
    sampleWishes: [
      { name: 'Fin (sahabat Noah)', message: 'Akhirnya, kawan! Dari dulu aku sudah bilang kalian berdua memang ditakdirkan bersama. Selamat ya! 🛶', minutesAgo: 2 },
      { name: 'Tante Martha', message: 'Selamat menempuh hidup baru, Noah & Allie. Semoga cinta kalian tetap sehangat surat-surat yang dulu ditulis setiap hari.', minutesAgo: 120 },
      { name: 'Om Frank & keluarga Seabrook', message: 'Ikut bahagia untuk kalian berdua. Semoga rumah kalian selalu penuh tawa, doa kami menyertai dari jauh 🤍', minutesAgo: 26 * 60 },
    ],
  },

  date,
  coverPhoto: prewed1Large,
  coverNames: ['Noah', 'Allie'],
  // Both portraits are cut from the one photo, as in Figma.
  groom: { name: 'Noah C, ST.', parentsLabel: 'Putra dari', parents: 'Bapak Lorem Ipsum & Ibu Dolor Sit A', photo: couplePhotos },
  bride: { name: 'Allie Hamidah', parentsLabel: 'Putri dari', parents: 'Bapak Lorem Ipsum & Ibu Dolor Sit A', photo: couplePhotos },
  gallery: [
    { photo: prewed1, large: prewed1Large },
    { photo: prewed2, large: prewed2Large },
    { photo: prewed3, large: prewed3Large },
    { photo: prewed4, large: prewed4Large },
  ],
  // The line breaks are Figma's.
  story: [
    { title: '1 Juni 2018', text: 'Berawal dari dikenalkan oleh\nteman kantor. Tak disangka,\nperkenalan sederhana ini\nmenjadi awal dari perjalanan\nkami.' },
    { title: '14 Agustus 2018', text: 'Setelah kurang lebih dua bulan\nPDKT, akhirnya kami\nmemutuskan untuk menjalin\nhubungan dan memulai cerita\nsebagai pasangan.' },
    { title: '19 Desember 2025', text: 'Setelah bertahun-tahun\nmelewati suka dan duka\nbersama, kami mengikat janji\nuntuk melangkah ke tahap\nberikutnya.' },
    {
      title: formatIsoDate(date, 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      text: 'Hari di mana cerita kami\nberlanjut ke babak baru. Bukan\nlagi sekadar tentang aku dan\nkamu, tapi tentang kita dan\nselamanya.',
    },
  ],
  venue: { name: 'Masjid Istiqlal Jakarta' },
  ceremony: { time: '10.00 WIB' },
  reception: { time: '10.00 WIB', venue: { name: 'Hotel Mulia', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel%20Mulia%20Jakarta' } },
  bank: { bank: 'Bank BCA', number: '123456789', holder: 'a.n. Noah Cahyono' },
  giftDelivery: {
    name: 'Allie H.',
    addressLines: ['Jl. Anggrek Loka No. 24,', 'RT 005 / RW 002 Kel. Meruya Utara,', 'Kec. Kembangan Jakarta Barat,', 'DKI Jakarta, 11620', 'No. HP: 0812-3456-7890'],
  },
  closing: { signature: 'Noah & Allie' },
};
