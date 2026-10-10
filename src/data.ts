import { Template } from './types';

// Set `visible` to show or hide a template in the homepage catalog; its /template/... page
// keeps working either way.
export const TEMPLATES: Template[] = [
  {
    id: 'tema-friends',
    name: 'TEMA FRIENDS',
    visible: true,
    subtitle: 'Terinspirasi dari serial Friends, dengan pintu ungu ikonik, sofa oranye Central Perk, dan nuansa ceria penuh tawa bersama sahabat.',
    code: 'KODE TEMA FRIENDS DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'film',
    bgColor: 'bg-[#A07EB9]',
    textColor: 'text-white',
    previewType: 'card',
    details: {
      husband: 'Radit',
      wife: 'Ratu',
      date: '27 September 2027',
      location: 'Grant House, Jawa Barat',
      quote: 'We can have any future you want.',
      accentColor: '#FBDA43'
    }
  },
  {
    id: 'tema-lalaland',
    name: 'TEMA LA LA LAND',
    visible: true,
    subtitle: 'Terinspirasi dari La La Land, dengan langit malam berbintang, lampu jalan kota, dan nuansa romantis ala film musikal.',
    code: 'KODE TEMA LA LA LAND DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'film',
    bgColor: 'bg-[#081A51]',
    textColor: 'text-white',
    previewType: 'card',
    details: {
      husband: 'Sebastian',
      wife: 'Mia',
      date: '23 Agustus 2026',
      location: 'Gedung Serbaguna ABC, Kota Bogor',
      quote: "Here's to the ones who dream, foolish as they may seem.",
      accentColor: '#F9DE1F'
    }
  },
  {
    id: 'tema-notebook',
    name: 'TEMA THE NOTEBOOK',
    visible: true,
    subtitle: 'Terinspirasi dari The Notebook, dengan lukisan danau, surat cinta bersegel lilin, dan nuansa taman yang hangat dan romantis.',
    code: 'KODE TEMA THE NOTEBOOK DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'film',
    bgColor: 'bg-[#FEFFFA]',
    textColor: 'text-[#324532]',
    previewType: 'card',
    details: {
      husband: 'Noah',
      wife: 'Allie',
      date: '14 Februari 2027',
      location: 'Masjid Istiqlal Jakarta',
      quote: 'I want all of you, forever, everyday. You and me... everyday.',
      accentColor: '#ABA935'
    }
  },
  {
    id: 'tema-crazy-little-thing',
    name: 'TEMA CRAZY LITTLE THING CALLED LOVE',
    visible: true,
    subtitle: 'Terinspirasi dari Crazy Little Thing Called Love, dengan nuansa scrapbook manis, foto polaroid, dan kisah cinta pertama yang tak terlupakan.',
    code: 'KODE TEMA CRAZY LITTLE THING CALLED LOVE DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'film',
    bgColor: 'bg-[#FFF4E8]',
    textColor: 'text-[#70564B]',
    previewType: 'card',
    details: {
      husband: 'Radit',
      wife: 'Ratu',
      date: '27 September 2026',
      location: 'Gedung Serbaguna ABC, Kota Bogor',
      quote: 'He is the one who made me know a little thing called love.',
      accentColor: '#E58F9B'
    }
  },
  {
    id: 'tema-cherry',
    name: 'TEMA CHERRY',
    visible: false,
    subtitle: 'Undangan bergaya ilustrasi hangat dengan nuansa pink lembut dan tipografi playful.',
    code: 'KODE TEMA CHERRY DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'floral',
    bgColor: 'bg-[#FFB3C6]',
    textColor: 'text-[#3D1F1F]',
    previewType: 'card',
    details: {
      husband: 'Fadil',
      wife: 'Ratu',
      date: '01 Agustus 2027',
      location: 'Gedung Serbaguna ABC, Kota Bogor',
      quote: 'Cinta itu bukan mencari yang sempurna, tapi menikmati perjalanan bersama orang yang tepat.',
      accentColor: '#C1440E'
    }
  },
  {
    id: 'tema-sage',
    name: 'TEMA SAGE',
    visible: false,
    subtitle: 'Editorial modern minimalis dengan nuansa hijau sage, aksen emas, dan tipografi berspasi lebar.',
    code: 'KODE TEMA SAGE DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'modern',
    bgColor: 'bg-[#B2C5B0]',
    textColor: 'text-[#2D2D2D]',
    previewType: 'card',
    details: {
      husband: 'Fadil',
      wife: 'Ratu',
      date: '14 Februari 2027',
      location: 'The Hall Kemang, Jakarta Selatan',
      quote: 'Kebahagiaan sejati bukan tentang kemewahan, tapi tentang menemukan ketenangan bersama orang yang tepat.',
      accentColor: '#C9A84C'
    }
  },
  {
    id: 'tema-batik',
    name: 'TEMA BATIK',
    visible: false,
    subtitle: 'Nuansa pernikahan Jawa tradisional dengan eksekusi modern dan motif batik kawung yang elegan.',
    code: 'KODE TEMA BATIK DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'vintage',
    bgColor: 'bg-[#FDF6E3]',
    textColor: 'text-[#3D2B1F]',
    previewType: 'card',
    details: {
      husband: 'Fadil',
      wife: 'Ratu',
      date: '10 Oktober 2026',
      location: 'Pendopo Agung Ndalem, Yogyakarta',
      quote: 'Dan di antara tanda-tanda kekuasaan-Nya, diciptakan-Nya pasangan untukmu agar kamu merasa tenteram bersamanya.',
      accentColor: '#D4AF37'
    }
  },
  {
    id: 'tema-noir',
    name: 'TEMA NOIR',
    visible: false,
    subtitle: 'Kemewahan gaya gala malam dengan nuansa navy gelap, aksen emas, dan tipografi elegan.',
    code: 'KODE TEMA NOIR DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'modern',
    bgColor: 'bg-[#0A1628]',
    textColor: 'text-white',
    previewType: 'card',
    details: {
      husband: 'Fadil',
      wife: 'Ratu',
      date: '31 Desember 2026',
      location: 'Grand Ballroom, Hotel Mulia Senayan, Jakarta',
      quote: 'Cinta sejati adalah menemukan keindahan dalam kesederhanaan, bahkan di tengah gemerlapnya dunia.',
      accentColor: '#D4AF37'
    }
  },
  {
    id: 'tema-indigo',
    name: 'TEMA INDIGO',
    visible: false,
    subtitle: 'Gaya bold dan playful dengan nuansa navy gelap, aksen oranye cerah, dan tipografi tebal.',
    code: 'KODE TEMA INDIGO DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'modern',
    bgColor: 'bg-[#0D1B4B]',
    textColor: 'text-white',
    previewType: 'card',
    details: {
      husband: 'Fadil',
      wife: 'Ratu',
      date: '08 Januari 2027',
      location: 'Gedung Serbaguna ABC, Kota Bogor',
      quote: 'Dua hati yang bersatu, memulai babak baru penuh warna.',
      accentColor: '#FF5C00'
    }
  }
];

/** The templates listed in the homepage catalog, in order. */
export const CATALOG_TEMPLATES = TEMPLATES.filter((t) => t.visible);
