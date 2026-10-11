// Homepage text that changes from time to time: prices, FAQ and testimonials.
// Edit here; the components in src/components/home only handle layout.
// The FAQ also feeds the FAQPage structured data (src/components/home/Faq.tsx), so what
// Google reads always matches what's on the page.

export const PRICING = {
  regular: {
    label: 'Koleksi reguler',
    badge: 'Harga promo',
    /** Shown struck through. Leave empty to hide it when there's no promo. */
    originalPrice: 'Rp199.000',
    price: 'Rp149.000',
    description:
      'Semua template reguler tersedia dengan satu harga. Pilih desain favoritmu, lalu kami siapkan detailnya.',
    features: [
      'Kisah perjalanan pasangan',
      'Galeri foto pre-wedding',
      'RSVP dan ucapan dari tamu',
      'Pilihan musik latar',
      'Kutipan dan pesan penutup',
      'Link personal untuk setiap tamu',
      'Aktif selama 12 bulan',
      'Cover custom dengan foto prewedding',
      'Amplop digital',
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
      'Konsep khusus di luar koleksi reguler, disesuaikan dengan cerita, kebutuhan, dan preferensimu.',
    details: [
      { term: 'Waktu pengerjaan', value: 'Sekitar 2 minggu' },
      { term: 'Revisi & lingkup', value: 'Disepakati sebelum mulai' },
    ],
    whatsappMessage: 'Halo nice mice, saya ingin konsultasi desain custom untuk undangan digital.',
  },
  addons: [
    {
      title: 'Express delivery (hanya untuk regular template)',
      description: 'Selesai dalam 1 × 24 jam pada hari kerja.',
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
    title: 'Jadikan nice mice bagian dari paket layananmu.',
    description: 'Harga spesial untuk partner dengan paket pembelian khusus.',
    whatsappMessage: 'Halo nice mice, saya tertarik bekerja sama sebagai partner (wedding organizer/vendor).',
  },
  note: 'Pengerjaan dimulai setelah seluruh materi lengkap dan jadwal dikonfirmasi. Harga final desain custom ditentukan setelah brief dibahas.',
};

export const FAQS = [
  {
    question: 'Bagaimana cara memesan dan membayar?',
    answer:
      'Pilih template reguler atau ceritakan kebutuhan desain custom-mu, lalu hubungi nice mice dan kirim detail acara beserta materi yang dibutuhkan. Pesanan reguler dibayar lunas di awal, sedangkan desain custom menggunakan DP 50% untuk memulai pengerjaan.',
  },
  {
    question: 'Apakah undangan mudah dibuka oleh tamu undangan?',
    answer:
      'Ya. Undangan bisa dibuka langsung melalui link yang dibagikan lewat WhatsApp atau platform pesan lainnya, tanpa perlu mengunduh aplikasi tambahan.',
  },
  {
    question: 'Apakah nama setiap tamu bisa dibuat berbeda?',
    answer: 'Bisa. Kamu dapat membuat dan mengatur link personal untuk setiap tamu secara mandiri.',
  },
  {
    question: 'Bagaimana jika saya tidak punya foto pre-wedding?',
    answer:
      'Kamu bisa menambahkan layanan Custom Couple Portrait berupa portrait atau ilustrasi pasangan yang disesuaikan dengan tema undangan. Harga mulai Rp99.000.',
  },
  {
    question: 'Bisakah saya meminta desain di luar koleksi reguler?',
    answer:
      'Bisa. Layanan desain custom dimulai dari Rp500.000 dengan waktu pengerjaan sekitar 2 minggu. Harga akhir mengikuti kompleksitas permintaan dan akan dikonfirmasi setelah brief dibahas.',
  },
  {
    question: 'Berapa kali saya bisa revisi?',
    answer:
      'Pesanan reguler sudah termasuk 2 kali revisi gratis. Satu kali revisi berarti satu daftar perubahan yang dikirim sekaligus. Kesalahan dari pihak kami selalu kami perbaiki gratis, dan perubahan data kecil seperti jam atau alamat gratis sampai H-3 acara. Revisi ketiga dan seterusnya dikenakan biaya Rp25.000 per revisi. Untuk desain custom, jumlah dan ruang lingkup revisi disepakati sebelum pengerjaan dimulai.',
  },
  {
    question: 'Berapa lama undangan aktif?',
    answer:
      'Link undangan reguler aktif selama 12 bulan. Tanggal mulai masa aktif akan dikonfirmasi saat pemesanan.',
  },
  {
    question: 'Apakah nice mice menerima kerja sama dengan vendor?',
    answer:
      'Ya. Kami terbuka untuk bekerja sama dengan wedding organizer dan vendor pernikahan lainnya. Hubungi kami untuk membahas peluang kerja sama dan harga khusus vendor.',
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
