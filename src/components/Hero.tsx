import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { HERO_TESTIMONIALS } from '../data';
import HERO_IMAGE from '../assets/images/nicemice_hero_mockup_1782005729125.jpg';

export default function Hero() {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Auto scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-16 pb-20 bg-gradient-to-b from-white to-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtle Pre-heading */}
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-zinc-50 border border-zinc-100/80 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
          <p className="font-serif italic text-zinc-600 text-sm tracking-wide">
            Website & Undangan Pernikahan Modern
          </p>
        </div>

        {/* Major Headline */}
        <h1 className="max-w-4xl mx-auto font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[-0.03em] text-zinc-950 leading-[1.05] mb-8">
          Undangan Pernikahan <span className="font-serif italic font-normal text-zinc-800">Estetik</span> yang Dirancang Khusus <br className="hidden sm:inline" />
          untuk <span className="underline decoration-[#C5A059] decoration-wavy decoration-3 underline-offset-8">Hari Istimewa Anda</span>.
        </h1>

        {/* CTA Button */}
        <div className="mb-14">
          <a
            href="#invitations"
            className="inline-flex items-center gap-3 bg-[#C5A059] hover:bg-[#b08c4a] text-white font-sans font-bold text-xs sm:text-sm tracking-widest uppercase px-8 py-4 rounded-sm border border-[#C5A059]/10 shadow-lg shadow-amber-900/10 transition-all duration-300 hover:scale-105 active:scale-95 group"
          >
            Lihat Template
            <ArrowRight className="w-4 h-4 text-zinc-900 group-hover:translate-x-1.5 transition-transform" />
          </a>
        </div>

        {/* Main Hero Photographic Composition */}
        <div className="relative max-w-5xl mx-auto mb-16 px-4">
          {/* Absolute decorative backdrops to make it look premium */}
          <div className="absolute top-1/4 -left-10 w-44 h-44 bg-amber-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-1/4 -right-10 w-44 h-44 bg-amber-100/30 rounded-full blur-3xl opacity-50"></div>

          {/* Designer mockup frame */}
          <div className="relative bg-white p-3 sm:p-5 rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden group">
            <div className="aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-xl">
              <img
                src={HERO_IMAGE}
                alt="Mockup undangan digital dan website premium nicemice"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Micro tag overlay */}
            <div className="absolute top-8 left-8 bg-zinc-900/90 backdrop-blur-md text-white py-1.5 px-3.5 rounded-full text-[10px] tracking-widest font-sans font-medium flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-[#C5A059]" />
              TEMPLAT ADIBUSANA NO. 20
            </div>
          </div>
        </div>

        {/* Hero Testimonial Quote Slider */}
        <div className="max-w-2xl mx-auto relative px-8 mt-12 bg-white/70 backdrop-blur-sm shadow-sm border border-zinc-150/40 py-8 rounded-2xl">
          {/* Subtle quotation icon */}
          <div className="text-zinc-200 text-6xl font-serif absolute -top-5 left-8 select-none">“</div>

          {/* Dynamic Testimonial Display */}
          <div className="transition-all duration-500 ease-in-out min-h-[96px] flex flex-col justify-center">
            <p className="font-serif italic text-lg sm:text-xl text-zinc-700 leading-relaxed">
              "{HERO_TESTIMONIALS[currentIdx].quote}"
            </p>
            <p className="mt-4 font-sans tracking-[0.2em] font-medium text-[10px] sm:text-xs text-zinc-400 uppercase">
              OLEH_{HERO_TESTIMONIALS[currentIdx].author} — {HERO_TESTIMONIALS[currentIdx].location}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setCurrentIdx((prev) => (prev === 0 ? HERO_TESTIMONIALS.length - 1 : prev - 1))}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-1.5">
              {HERO_TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentIdx ? 'bg-zinc-800 w-4' : 'bg-zinc-200 hover:bg-zinc-400'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentIdx((prev) => (prev + 1) % HERO_TESTIMONIALS.length)}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editorial Subtext */}
        <p className="mt-16 text-zinc-400 font-sans tracking-[0.14em] text-[10px] sm:text-xs uppercase font-medium max-w-lg mx-auto leading-relaxed">
          Temukan dan sesuaikan undangan berkualitas premium yang unik untuk setiap babak hari istimewa Anda.
        </p>
      </div>
    </section>
  );
}
