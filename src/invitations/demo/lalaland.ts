import coverPhoto from '../../assets/images/lalaland/figma/8d654.webp';
import groom from '../../assets/images/lalaland/figma/68dbe.webp';
import bride from '../../assets/images/lalaland/figma/c95c9.webp';
import gallery1 from '../../assets/images/lalaland/figma/498fb.webp';
import gallery2 from '../../assets/images/lalaland/figma/1a1e9.webp';
import gallery2Large from '../../assets/images/lalaland/figma/1a1e9-lg.webp';
import gallery3 from '../../assets/images/lalaland/figma/6e588.webp';
import gallery3Large from '../../assets/images/lalaland/figma/6e588-lg.webp';
import gallery4 from '../../assets/images/lalaland/figma/200d5.webp';
import gallery4Large from '../../assets/images/lalaland/figma/200d5-lg.webp';
import gallery5 from '../../assets/images/lalaland/figma/5b958.webp';
import gallery5Large from '../../assets/images/lalaland/figma/5b958-lg.webp';
import { formatIsoDate, isoDateFromToday } from '../dates';
import type { LaLaLandInvitation } from '../types';

const date = isoDateFromToday(30);

/** nicemice.id/template/lalaland: the La La Land design with its Figma sample content. */
export const lalalandDemo: LaLaLandInvitation = {
  template: 'lalaland',
  coupleNames: 'Sebastian & Mia',
  greeting: 'Kepada',
  guestFallback: 'Bapak/Ibu/Saudara/i',
  music: `${import.meta.env.BASE_URL}lalaland-music.m4a`,
  demo: {
    sampleGuest: 'Emma & Ryan',
    sampleWishes: [
      { name: 'Keith (teman band)', message: 'Akhirnya! Selamat ya kalian berdua, ikut senang banget. Sampai ketemu di hari H, siap nyanyi di resepsi! 🎶', minutesAgo: 2 },
      { name: 'Bu Greta & tim kantor', message: 'Selamat menempuh hidup baru, Mia & Sebastian. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.', minutesAgo: 120 },
      { name: 'Tante Laura', message: 'Selamat ya, sayang. Tante doakan rukun selalu dan langgeng sampai kakek nenek. Peluk dari jauh 🤍', minutesAgo: 26 * 60 },
    ],
  },

  date,
  coverPhoto,
  coverNames: ['Sebastian', 'Mia'],
  groom: { name: 'Sebastian Wilder', parentsLabel: 'Putra dari', parents: 'Bapak Ari W dan Ibu Dian S', photo: groom },
  bride: { name: 'Mia Dolan', parentsLabel: 'Putri dari', parents: 'Bapak Jerome P dan Ibu Cania C', photo: bride },
  gallery: [
    { photo: gallery1 },
    { photo: gallery2, large: gallery2Large },
    { photo: gallery3, large: gallery3Large },
    { photo: gallery4, large: gallery4Large },
    { photo: gallery5, large: gallery5Large },
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
  venue: { name: 'Gedung Serbaguna ABC', addressLines: ['Jl. Cempaka No. 18,', 'Kota Bogor, Jawa Barat'] },
  ceremony: { time: '08.00 - 11.00' },
  reception: { time: '11.00 - selesai' },
  bank: { bank: 'Bank BCA', number: '123456789', holder: 'a.n. Mia Dolan' },
  giftDelivery: {
    name: 'Sebastian W',
    addressLines: ['Jl. Anggrek Loka No. 24,', 'RT 005 / RW 002 Kel. Meruya Utara,', 'Kec. Kembangan Jakarta Barat,', 'DKI Jakarta, 11620', 'No. HP: 0812-3456-7890'],
  },
  closing: {
    text: 'Terima kasih telah menjadi bagian dari cerita kami\ndan berbagi kebahagiaan di hari istimewa ini.',
    signature: 'Sebastian & Mia',
  },
};
