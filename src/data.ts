import { Template, Testimonial, BlogPost, JourneyStep } from './types';

export const TEMPLATES: Template[] = [
  {
    id: 'tema-cherry',
    name: 'TEMA CHERRY',
    subtitle: 'Undangan bergaya ilustrasi hangat dengan nuansa pink lembut dan tipografi playful.',
    code: 'KODE TEMA CHERRY DESAIN AESTHETIC DAN GAK PASARAN',
    category: 'floral',
    bgColor: 'bg-[#FDE8E8]',
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
