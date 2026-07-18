import { Template, Testimonial, BlogPost, JourneyStep } from './types';

export const TEMPLATES: Template[] = [
  {
    id: 'tema-20',
    name: 'TEMA 20',
    subtitle: 'Editorial klasik dengan nuansa arang pekat dan kisi-kisi seni garis yang terstruktur.',
    code: 'KODE TEMA 20 DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'minimalist',
    bgColor: 'bg-zinc-900',
    textColor: 'text-zinc-100',
    borderColor: 'border-zinc-700',
    previewType: 'card',
    details: {
      husband: 'FADIL',
      wife: 'RATU',
      date: 'Sabtu, 14 November 2026',
      location: 'Paviliun Kaca, Jakarta',
      quote: 'Dan petualangan terbesar kami pun dimulai.',
      accentColor: '#FFFFFF'
    }
  },
  {
    id: 'tema-19',
    name: 'TEMA 19',
    subtitle: 'Tata letak kisi tipografi modern dengan spasi huruf ultra-modern.',
    code: 'KODE TEMA 19 DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'modern',
    bgColor: 'bg-zinc-950',
    textColor: 'text-[#EAE6DF]',
    previewType: 'grid',
    details: {
      husband: 'FADIL',
      wife: 'RATU',
      date: '12.11.26',
      location: 'Taman Amaryllis',
      quote: 'Dua jiwa, satu melodi yang indah.',
      accentColor: '#D4AF37'
    }
  },
  {
    id: 'tema-18',
    name: 'TEMA 18',
    subtitle: 'Teks pengumuman melingkar yang halus dengan aksen tengah yang anggun.',
    code: 'KODE TEMA 18 DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'modern',
    bgColor: 'bg-[#FDFBF7]',
    textColor: 'text-zinc-800',
    borderColor: 'border-amber-100',
    previewType: 'circular',
    details: {
      husband: 'Fadil',
      wife: 'Ratu',
      date: 'Sabtu, 12 November 2026',
      location: 'Alila Villas Uhuru, Bali',
      quote: 'UNTUK SALING MEMILIKI DAN MENJAGA',
      accentColor: '#8C7A5B'
    }
  },
  {
    id: 'tema-17',
    name: 'TEMA 17',
    subtitle: 'Kanvas persik hangat yang lembut dengan garis-garis organik mengalir yang elegan.',
    code: 'KODE TEMA 17 DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'minimalist',
    bgColor: 'bg-[#FCF4EE]',
    textColor: 'text-[#825F4C]',
    previewType: 'card',
    details: {
      husband: 'Fadil',
      wife: 'Ratu',
      date: '12 . 11 . 26',
      location: 'Bumi Sampireun, Jakarta',
      quote: 'Cinta hidup dalam kesederhanaan detail.',
      accentColor: '#BD8A70'
    }
  },
  {
    id: 'tema-16',
    name: 'TEMA 16',
    subtitle: 'Desain bingkai lengkung arsitektur yang elegan dipadukan dengan garis minimalis bernuansa krem muda.',
    code: 'KODE TEMA 16 DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'vintage',
    bgColor: 'bg-[#F5F2EB]',
    textColor: 'text-zinc-800',
    previewType: 'floral-panel',
    details: {
      husband: 'Fadil',
      wife: 'Ratu',
      date: 'Sabtu, 12 November 2026',
      location: 'Kempinski Ballroom Hotel',
      quote: 'Kami mengundang Anda untuk berbagi kebahagiaan bersama kami.',
      accentColor: '#A89F91'
    }
  },
  {
    id: 'tema-15',
    name: 'TEMA 15',
    subtitle: 'Bingkai ornamen antik dengan ilustrasi cat air bunga romantis.',
    code: 'KODE TEMA 15 DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'floral',
    bgColor: 'bg-[#EDF2EB]',
    textColor: 'text-[#2D4A22]',
    previewType: 'floral-panel',
    details: {
      husband: 'Fadil',
      wife: 'Ratu',
      date: '12.11.22',
      location: 'Taman Mini Indonesia Indah',
      quote: 'Awal dari kebersamaan selamanya.',
      accentColor: '#7D9E71'
    }
  },
  {
    id: 'tema-14',
    name: 'TEMA 14',
    subtitle: 'Desain sampul album piringan hitam modern untuk pencinta musik.',
    code: 'KODE TEMA 14 DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'modern',
    bgColor: 'bg-[#E3ECE6]',
    textColor: 'text-[#3E5146]',
    previewType: 'record',
    details: {
      husband: 'Fadil',
      wife: 'Ratu',
      date: 'Sabtu, 12 November 2026',
      location: 'Sunset Bay Resort, Lombok',
      quote: 'Kisah cinta kami, terus berputar.',
      accentColor: '#A3B899'
    }
  },
  {
    id: 'tema-13',
    name: 'TEMA 13',
    subtitle: 'Latar belakang merah tua yang megah dengan huruf bernuansa emas yang canggih.',
    code: 'KODE TEMA 13 DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'vintage',
    bgColor: 'bg-[#4B0F15]',
    textColor: 'text-[#F3E5D8]',
    previewType: 'card',
    details: {
      husband: 'FADIL',
      wife: 'RATU',
      date: '12 . 11 . 2026',
      location: 'Gedung Warisan Kerajaan',
      quote: 'Dalam cinta, kita dipersatukan.',
      accentColor: '#D4AF37'
    }
  }
];

export const HERO_TESTIMONIALS: Testimonial[] = [
  {
    id: 'ht1',
    quote: "Saya menggunakan nicemice untuk situs pernikahan saya. Sangat modern dan bernuansa editorial, tidak seperti platform lainnya! Sangat suka!",
    author: "THE_J",
    role: "Pengantin Wanita",
    location: "Bandung, Jawa Barat"
  },
  {
    id: 'ht2',
    quote: "Antarmuka RSVP tamu sangat memukau. Kami menerima banyak pujian dari teman-teman tentang betapa bersih dan mudahnya proses tersebut.",
    author: "CLARA & MARC",
    role: "Pengantin Pria",
    location: "Jakarta, DKI Jakarta"
  },
  {
    id: 'ht3',
    quote: "Tidak ada platform lain yang memberi kontrol tipografi editorial setinggi ini. Tata letak kami terasa sangat berkelas, bukan seperti templat biasa.",
    author: "ELIZABETH_V",
    role: "Pengantin Wanita",
    location: "Surabaya, Jawa Timur"
  }
];

export const DETAILED_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    quote: "Kami mencari berminggu-minggu platform pernikahan digital yang tidak terasa murahan atau terlalu banyak animasi. nicemice benar-benar sebuah kebahagiaan luar biasa. Presisi tipografi, tata letak yang indah, dan alur RSVP yang mulus sungguh sempurna. Tamu kami bahkan mengambil tangkapan layar undangan untuk memberi tahu betapa indahnya itu!",
    author: "Sarah & David",
    role: "Menikah November 2025",
    location: "Denpasar, Bali",
    rating: 5
  },
  {
    id: 't2',
    quote: "Sebagai seorang desainer produk, saya sempat malas membuat situs pernikahan karena platform lain sangat membatasi kreativitas. nicemice berada di kelasnya sendiri. Kustomisasi tipografi lengkap, palet warna elegan, dan editor yang sangat intuitif. Rasanya seperti agensi papan atas yang membangunnya khusus untuk kami.",
    author: "Elena & Jordan",
    role: "Menikah Februari 2026",
    location: "Yogyakarta",
    rating: 5
  },
  {
    id: 't3',
    quote: "Tim layanan desainer sangat membantu saya! Saya menginginkan tata letak monospace khusus yang memadukan kisi-kisi Swiss kontemporer dengan warna bunga yang lembut. Mereka membangunnya dalam waktu kurang dari satu jam, membantu menghubungkan domain kustom kami, dan menguji tautan RSVP. Tamu kami sangat senang menggunakannya, dan kami menerima 100% RSVP dalam tiga minggu.",
    author: "Amara & Charles",
    role: "Menikah Juni 2025",
    location: "Semarang",
    rating: 5
  },
  {
    id: 't4',
    quote: "Undangan digital terlihat sangat tajam di ponsel dan latar belakang musik yang terintegrasi menjadi favorit semua orang. Kemampuan untuk mengubah tanggal dengan mudah dan mengirim pembaruan massal secara instan selama pemindahan lokasi sangat sebanding dengan biayanya. Vendor terbaik yang kami sewa sejauh ini.",
    author: "Marcus & Liam",
    role: "Menikah April 2026",
    location: "Medan",
    rating: 5
  }
];

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    timeline: '12 BULAN SEBELUMNYA',
    title: 'Kumpulkan inspirasi & mulai buat moodboard',
    checklist: [
      'Jelajahi estetika pernikahan dan palet warna',
      'Pesan sampel desain dan panduan gaya',
      'Buat profil pernikahan digital nicemice dasar Anda',
      'Jelajahi desain tipografi Save-the-Date',
      'Kumpulkan email & alamat rumah tamu di perencana daftar kami',
      'Pelajari lebih lanjut tentang penawaran premium digital kami'
    ]
  },
  {
    timeline: '7-8 BULAN SEBELUMNYA',
    title: 'Kirimkan save the dates Anda',
    checklist: [
      'Pesan sesi desain 30 menit dengan pakar pernikahan',
      'Jelajahi pilihan aksen visual, palet kustom, & tekstur digital',
      'Rilis halaman Save-the-Date Anda',
      'Luncurkan situs pernikahan aktif Anda untuk pemesanan penerbangan segera',
      'Mulai memilih kombinasi fon yang cocok untuk undangan Anda'
    ]
  },
  {
    timeline: '5-6 BULAN SEBELUMNYA',
    title: 'Jelajahi undangan',
    checklist: [
      'Gunakan pencari undangan cerdas kami untuk mempersempit tema',
      'Jelajahi kartu lampiran digital dan peta',
      'Baca aturan & panduan susunan kata undangan yang kohesif',
      'Selaraskan daftar hadiah pernikahan Anda ke dasbor menu utama',
      'Lakukan uji coba alur RSVP langsung untuk melihat pratinjau tamu'
    ]
  },
  {
    timeline: '3-4 BULAN SEBELUMNYA',
    title: 'Kirimkan undangan Anda',
    checklist: [
      'Selesaikan daftar tamu dan klik Kirim pada undangan digital',
      'Sesuaikan tema untuk acara pranikah atau makan malam keluarga',
      'Jelajahi kebutuhan hari-H: kartu menu digital, penanda meja, dan buku panduan acara',
      'Jelajahi kartu ucapan terima kasih yang sesuai dengan tema estetika Anda',
      'Lihat jumlah RSVP waktu nyata secara berkala di dasbor portal Anda'
    ]
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Mendesain Alur RSVP Digital untuk Kebahagiaan Tamu yang Maksimal',
    excerpt: 'Panduan pasti untuk menyusun urutan tanggapan digital elegan yang membuat tamu bersemangat dan mengumpulkan preferensi makanan akurat dengan mudah.',
    imageUrl: new URL('./assets/images/blog_rsvp_guide_1782005743604.jpg', import.meta.url).href,
    date: '18 Juni 2026',
    readTime: 'Baca 5 mnt'
  },
  {
    id: 'blog-2',
    title: 'Seni Menyusun Redaksi Kalimat Undangan Pernikahan Modern',
    excerpt: 'Dari permintaan kado santai hingga dinamika keluarga terpadu, berikut adalah cara mengomunikasikan detail penting dengan keanggunan, kejelasan, dan kehangatan.',
    imageUrl: new URL('./assets/images/blog_wording_rules_1782005760022.jpg', import.meta.url).href,
    date: '20 Mei 2026',
    readTime: 'Baca 7 mnt'
  },
  {
    id: 'blog-3',
    title: '10 Palet Warna Elegan yang Sempurna untuk Pernikahan Minimalis',
    excerpt: 'Temukan warna putih gading, nuansa batu organik netral, dan sentuhan sepia halus yang menciptakan kesan gaya editorial mode papan atas secara instan.',
    imageUrl: new URL('./assets/images/blog_color_palettes_1782005773928.jpg', import.meta.url).href,
    date: '12 April 2026',
    readTime: 'Baca 4 mnt'
  }
];
