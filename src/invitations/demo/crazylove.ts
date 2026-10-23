import coverPhoto from '../../assets/images/crazylove/cover-photo.webp';
import groom from '../../assets/images/crazylove/groom.webp';
import bride from '../../assets/images/crazylove/bride.webp';
import map from '../../assets/images/crazylove/map.webp';
import photo1 from '../../assets/images/crazylove/photo-1.webp';
import photo1Large from '../../assets/images/crazylove/photo-1-lg.webp';
import photo3 from '../../assets/images/crazylove/photo-3.webp';
import photo3Large from '../../assets/images/crazylove/photo-3-lg.webp';
import photo4 from '../../assets/images/crazylove/photo-4.webp';
import photo4Large from '../../assets/images/crazylove/photo-4-lg.webp';
import photo5 from '../../assets/images/crazylove/photo-5.webp';
import photo5Large from '../../assets/images/crazylove/photo-5-lg.webp';
import photo6 from '../../assets/images/crazylove/photo-6.webp';
import photo6Large from '../../assets/images/crazylove/photo-6-lg.webp';
import photo7 from '../../assets/images/crazylove/photo-7.webp';
import photo7Large from '../../assets/images/crazylove/photo-7-lg.webp';
import photo10 from '../../assets/images/crazylove/photo-10.webp';
import photo10Large from '../../assets/images/crazylove/photo-10-lg.webp';
import { formatIsoDate, isoDateFromToday } from '../dates';
import type { CrazyLoveInvitation } from '../types';

const date = isoDateFromToday(30);

/** nicemice.id/template/crazy-little-thing: the Crazy Little Thing Called Love design with its Figma sample content. */
export const crazyLoveDemo: CrazyLoveInvitation = {
  template: 'crazylove',
  coupleNames: 'Ratu & Radit',
  greeting: 'Dear',
  guestFallback: 'Bapak/Ibu/Saudara/i',
  music: `${import.meta.env.BASE_URL}crazy-love-music.mp3`,
  demo: {
    sampleGuest: 'Chon & Nam',
    sampleWishes: [
      { name: 'Nim, Gie & Jeab', message: 'Akhirnya resmi juga! Dari zaman sekolah kami sudah tahu kalian berdua saling suka. Selamat ya! 💗', minutesAgo: 2 },
      { name: 'Bu Inn (wali kelas)', message: 'Selamat menempuh hidup baru, Ratu & Radit. Semoga selalu rukun, saling menjaga dan bahagia sampai tua.', minutesAgo: 120 },
      { name: 'Om Top & keluarga', message: 'Ikut bahagia untuk kalian berdua. Semoga rumah kalian selalu hangat dan penuh tawa, doa kami dari jauh 🤍', minutesAgo: 26 * 60 },
    ],
  },

  date,
  coverPhoto,
  groom: { name: 'Raditya M Fadil', parentsLabel: 'Putra dari', parents: 'Bapak Niskala Saputra dan Ibu Dian Santri', photo: groom },
  bride: { name: 'Ratu Regina', parentsLabel: 'Putri dari', parents: 'Bapak Harry Tuna dan Ibu Liliana Teratai', photo: bride },
  // Figma uses photo-1 twice: in the collage and as the grid's wide photo.
  gallery: [
    { photo: photo6, large: photo6Large },
    { photo: photo1, large: photo1Large },
    { photo: photo4, large: photo4Large },
    { photo: photo1, large: photo1Large },
    { photo: photo3, large: photo3Large },
    { photo: photo10, large: photo10Large },
    { photo: photo7, large: photo7Large },
    { photo: photo5, large: photo5Large },
  ],
  story: [
    { title: '1 Juni 2018', text: 'Berawal dari dikenalkan oleh teman kantor. Tak disangka, perkenalan sederhana ini menjadi awal dari perjalanan kami.' },
    { title: '14 Agustus 2018', text: 'Setelah kurang lebih dua bulan PDKT, akhirnya kami memutuskan untuk menjalin hubungan dan memulai cerita sebagai pasangan.' },
    { title: '19 Desember 2025', text: 'Setelah bertahun-tahun melewati suka dan duka bersama, kami mengikat janji untuk melangkah ke tahap berikutnya.' },
    {
      title: formatIsoDate(date, 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      text: 'Hari di mana cerita kami berlanjut ke babak baru. Bukan lagi sekadar tentang aku dan kamu, tapi tentang kita dan selamanya.',
    },
  ],
  venue: { name: 'Masjid Al-Abror', addressLines: ['Jl. Kenanga No. 17'] },
  ceremony: { time: '08.00 - selesai' },
  reception: { time: '11.00 - 14.00', venue: { name: 'Gedung Serbaguna ABC', addressLines: ['Jl. Cempaka No. 18', 'Kota Bogor, Jawa Barat'], mapImage: map } },
  dresscode: { text: 'Tamu diharapkan mengenakan kebaya dan batik' },
  bank: { bank: 'Bank BCA', number: '123456789', holder: 'a.n. Raditya M Fadil' },
  giftDelivery: {
    name: 'Ratu Regina',
    addressLines: ['Jl. Anggrek Loka No. 24,', 'RT 005 / RW 002 Kel. Meruya Utara,', 'Kec. Kembangan Jakarta Barat,', 'DKI Jakarta, 11620', 'No. HP: 0812-3456-7890'],
  },
  closing: { signature: 'Ratu & Radit' },
};
