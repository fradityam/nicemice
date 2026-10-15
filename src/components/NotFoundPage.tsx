import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/** Any link that isn't a page: a mistyped invitation link, most likely. */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-serif italic text-zinc-500 text-lg mb-2">Halaman tidak ditemukan</p>
        <h1 className="font-sans text-4xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight leading-[1.15] mb-4">
          Undangan tidak ditemukan
        </h1>
        <p className="text-zinc-500 text-[0.9375rem] leading-[1.6] mb-10">
          Coba periksa kembali tautan yang kamu terima, atau minta tautan baru dari pengirim undangan.
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
