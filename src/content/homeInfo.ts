// Homepage text that changes from time to time: prices, FAQ and testimonials.
// Edit here; the components in src/components/home only handle layout.
// Prices and the FAQ also feed the homepage's structured data (src/content/structuredData.ts),
// so what Google reads always matches what's on the page.

export const PRICING = {
  regular: {
    label: 'Katalog Nice Mice',
    badge: 'Harga Promo',
    /** Shown struck through. Leave empty to hide it when there's no promo. */
    originalPrice: 'Rp199.000',
    price: 'Rp149.000',
    description:
      'Pilih tema yang kamu suka, kirim detail acara, dan kami siapkan undangannya sampai siap disebar.',
    features: [
      'Kisah perjalanan pasangan',
      'RSVP dan ucapan dari tamu',
      'Kutipan dan pesan penutup',
      'Aktif selama 12 bulan',
      'Amplop digital',
      'Galeri foto pre-wedding',
      'Pilihan musik latar',
      'Link personal untuk setiap tamu',
      'Cover custom dengan foto prewedding',
      'Peta lokasi acara',
    ],
    terms: [
      { value: '3 × 24 jam', label: 'hari kerja' },
      { value: '2 kali', label: 'revisi gratis' },
    ],
  },
  custom: {
    label: 'Desain custom',
    priceLabel: 'Mulai dari',
    price: 'Rp500.000',
    description:
      'Punya konsep sendiri untuk undanganmu? Ceritakan idenya, dan kita bahas desain yang sesuai dengan cerita dan kebutuhanmu.',
    details: [
      { term: 'Waktu pengerjaan', value: 'Sekitar 2 minggu' },
      { term: 'Revisi dan lingkup', value: 'Disepakati sebelum mulai' },
    ],
    whatsappMessage: 'Halo Nice Mice, saya ingin konsultasi desain custom untuk undangan digital.',
  },
  addons: [
    {
      title: 'Express delivery (hanya untuk Katalog Nice Mice)',
      description: 'Selesai dalam 24 jam di hari kerja.',
      price: '+Rp80.000',
    },
    {
      title: 'Custom couple portrait',
      description: 'Portrait atau ilustrasi pasangan sesuai tema.',
      price: 'Mulai Rp99.000',
    },
  ],
  partner: {
    label: 'Untuk wedding organizer & vendor',
    title: 'Lengkapi paket pernikahanmu dengan Nice Mice',
    description: 'Harga spesial untuk partner dengan paket pembelian khusus.',
    whatsappMessage: 'Halo Nice Mice, saya tertarik bekerja sama sebagai partner (wedding organizer/vendor).',
  },
  note: 'Pengerjaan dimulai setelah seluruh materi lengkap dan jadwal dikonfirmasi. Harga final desain custom ditentukan setelah brief dibahas.',
};

export const FAQS = [
  {
    question: 'Bagaimana cara memesan dan membayar?',
    answer:
      'Pilih tema di katalog Nice Mice atau ceritakan kebutuhan desain custom-mu, lalu hubungi kami dan kirim detail acara beserta materi yang dibutuhkan. Untuk pesanan dari katalog, dibayar lunas di awal, sedangkan desain custom menggunakan DP 50% untuk memulai pengerjaan.',
  },
  {
    question: 'Apakah undangan mudah dibuka oleh tamu undangan?',
    answer:
      'Tentu saja! Undangan bisa dibuka langsung melalui link yang dibagikan lewat WhatsApp atau platform pesan lainnya, tanpa perlu mengunduh aplikasi tambahan.',
  },
  {
    question: 'Apakah nama setiap tamu bisa dibuat berbeda?',
    answer: 'Tentu! Kamu dapat membuat dan mengatur link personal untuk setiap tamu secara mandiri.',
  },
  {
    question: 'Bagaimana jika saya tidak punya foto pre-wedding?',
    answer:
      'Tidak masalah, kamu bisa menambahkan layanan Custom Couple Portrait berupa portrait atau ilustrasi pasangan yang disesuaikan dengan tema undangan. Harga mulai Rp99.000.',
  },
  {
    question: 'Bisakah saya meminta desain di luar Katalog Nice Mice?',
    answer:
      'Bisa banget! Layanan desain custom dimulai dari Rp500.000 dengan waktu pengerjaan sekitar 2 minggu. Harga akhir mengikuti kompleksitas permintaan dan akan dikonfirmasi setelah brief dibahas.',
  },
  {
    question: 'Berapa kali saya bisa revisi?',
    answer:
      'Setiap pesanan dari katalog Nice Mice sudah termasuk 2x revisi gratis. Satu kali revisi berarti satu daftar perubahan yang dikirim sekaligus. Kesalahan dari pihak kami diperbaiki gratis, begitu juga perubahan data kecil seperti nama atau alamat sampai H-3 acara. Revisi ketiga dan seterusnya dikenakan Rp25.000 per revisi. Untuk desain custom, jumlah dan ruang lingkup revisi disepakati sebelum pengerjaan dimulai.',
  },
  {
    question: 'Berapa lama link undangan bisa digunakan?',
    answer:
      'Link undangan aktif selama 12 bulan, terhitung sejak undangan final dikirim oleh tim Nice Mice, ya!',
  },
  {
    question: 'Apakah Nice Mice menerima kerja sama dengan vendor?',
    answer:
      'Kami sangat terbuka untuk bekerja sama dengan wedding organizer dan vendor pernikahan lainnya. Hubungi kami untuk membahas peluang kerja sama dan harga khusus vendor.',
  },
];

// Real client quotes, shared with the couples' permission. Keep them word for word.
export const TESTIMONIALS = [
  {
    quote:
      'Dari awal prosesnya menyenangkan banget. Hasilnya lebih dari yang kami bayangkan - rapi, mudah dibuka, dan semua tamu bilang undangannya lucu!',
    couple: 'Nabila & Arga',
    city: 'Jakarta',
  },
  {
    quote:
      'Kami langsung jatuh hati sama templatenya. Tinggal kirim data, lalu semuanya dibantu sampai undangan siap dibagikan. Praktis dan hasilnya tetap terasa personal.',
    couple: 'Dinda & Fajar',
    city: 'Bandung',
  },
  {
    quote:
      'Tampilannya cantik dan nyaman dibuka dari ponsel. RSVP jadi lebih rapi, tamu juga gampang menemukan semua informasi acara kami.',
    couple: 'Citra & Bima',
    city: 'Surabaya',
  },
];
