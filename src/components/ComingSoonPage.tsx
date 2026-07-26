import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-serif italic text-zinc-500 text-lg mb-2">{title}</p>
        <h1 className="font-sans text-4xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight leading-[1.15] mb-4">
          Segera Hadir 🌸
        </h1>
        <p className="text-zinc-500 text-[0.9375rem] leading-[1.6] mb-10">
          Halaman ini sedang kami siapkan dengan penuh cinta. Sampai jumpa sebentar lagi!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#2D2D2D] hover:bg-[#C5A059] text-white font-sans font-bold text-xs tracking-widest uppercase px-6 py-3.5 rounded-full transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
