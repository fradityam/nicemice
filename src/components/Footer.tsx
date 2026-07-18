import React, { useState } from 'react';
import { Mail, ArrowRight, Instagram, Pin, Twitter, Check } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setIsSubscribed(false);
    }, 4000);
  };

  const footerLinks = [
    {
      title: 'PRODUK',
      links: [
        { label: 'Website Pernikahan', href: '#websites' },
        { label: 'Undangan Digital', href: '#invitations' },
        { label: 'Daftar Hadiah Pernikahan', href: '#registry' },
        { label: 'Kelola RSVP Tamu', href: '#guestmanager' },
      ],
    },
    {
      title: 'INSPIRASI',
      links: [
        { label: 'Blog Jurnal Desain', href: '#journal' },
        { label: 'Kisah Nyata Pernikahan', href: '#realweddings' },
        { label: 'Pilihan Sampel Warna', href: '#swatches' },
        { label: 'Seniman Independen', href: '#artists' },
        { label: 'Katalog Lookbook', href: '#lookbook' },
      ],
    },
    {
      title: 'SUMBER DAYA',
      links: [
        { label: 'Aturan Penulisan Undangan', href: '#wording' },
        { label: 'Panduan Teknis', href: '#planners' },
        { label: 'Koleksi Fon Premium', href: '#fonts' },
        { label: 'FAQ / Dukungan Langsung', href: '#support' },
        { label: 'Tingkatan Harga', href: '#pricing' },
      ],
    },
  ];

  return (
    <footer className="bg-zinc-950 text-[#FAF9F6] pt-20 pb-12 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Main upper footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12 pb-16 border-b border-zinc-800">

          {/* Brand Intro Column */}
          <div className="lg:col-span-2 space-y-6">
            <a href="/" className="font-serif text-2xl sm:text-3xl tracking-[0.05em] sm:tracking-[0.1em] text-white">
              nice<span className="text-[#C5A059] font-serif italic">mice</span>
            </a>

            <p className="text-zinc-400 text-[0.9375rem] sm:text-sm tracking-wide leading-[1.6] max-w-sm">
              Kami membantu pasangan kontemporer menciptakan undangan pernikahan berbasis web yang elegan dan website pernikahan yang dirancang secara profesional. Tanpa kekacauan templat umum, kontrol tipografi mutlak, dan fokus luar biasa pada kenyamanan pengguna.
            </p>

            {/* Social Links */}
            <div className="flex gap-4 items-center pt-2">
              <a href="#instagram" className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#pinterest" className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
                <Pin className="w-4 h-4" />
              </a>
              <a href="#twitter" className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-4 text-left">
              <h4 className="font-sans font-bold text-xs tracking-[0.15em] sm:tracking-[0.25em] text-zinc-500 uppercase">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-zinc-400 hover:text-[#C5A059] text-xs transition-colors tracking-wide leading-[1.5] block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Lower footer: newsletter & copyright list */}
        <div className="pt-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Local Newsletter Subscription Column */}
          <div className="w-full lg:max-w-md text-center lg:text-left space-y-2">
            <h5 className="font-serif text-sm uppercase tracking-wide sm:tracking-widest text-[#FAF9F6] leading-[1.4]">
              Berlangganan Jurnal Desain Kami
            </h5>
            <p className="text-zinc-400 text-[0.9375rem] sm:text-xs tracking-wide leading-[1.6]">
              Dapatkan konsep tata letak pernikahan, formula pilihan kata, dan saran desainer modern langsung di kotak masuk Anda.
            </p>

            {/* Form */}
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 pt-2 max-w-sm mx-auto lg:mx-0">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan alamat email..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-11 py-3 text-xs text-[#FAF9F6] tracking-wide placeholder-zinc-500 focus:outline-none focus:border-[#C5A059] font-sans"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#C5A059] text-white font-sans font-medium text-xs tracking-[0.1em] sm:tracking-[0.15em] px-6 py-3 sm:py-0 rounded-full hover:bg-[#b08c4a] transition-colors cursor-pointer"
                >
                  GABUNG
                </button>
              </form>
            ) : (
              <div className="p-4 sm:p-3 bg-zinc-900 border border-[#C5A059]/20 rounded-2xl sm:rounded-full flex items-center justify-center gap-2 text-[#C5A059] text-xs font-semibold tracking-tight sm:tracking-widest font-sans uppercase animate-fade-in mt-4 leading-[1.5] text-center">
                <Check className="w-3.5 h-3.5 text-[#C5A059] animate-bounce flex-shrink-0" />
                TETAP DI SINI! PERIKSA KOTAK MASUK ANDA SEBENTAR LAGI.
              </div>
            )}
          </div>

          {/* Copyright, Credits and Terms */}
          <div className="text-center lg:text-right space-y-2 text-zinc-500 text-xs font-sans tracking-wide sm:tracking-widest leading-[1.5]">
            <p>&copy; {new Date().getFullYear()} NICEMICE STUDIOS INC. HAK CIPTA DILINDUNGI UNDANG-UNDANG.</p>
            <div className="flex flex-wrap justify-center lg:justify-end gap-x-4 gap-y-1 uppercase font-bold text-xs text-zinc-600">
              <a href="#privacy" className="hover:text-zinc-400 transition-colors">Kebijakan Privasi</a>
              <span>•</span>
              <a href="#terms" className="hover:text-zinc-400 transition-colors">Ketentuan Layanan</a>
              <span>•</span>
              <a href="#cookies" className="hover:text-zinc-400 transition-colors">Preferensi Cookie</a>
            </div>
            <p className="text-xs text-zinc-700 font-serif italic mt-4 leading-[1.5]">
              Sentuhan digital elegan untuk hari bahagia pasangan modern.
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}
