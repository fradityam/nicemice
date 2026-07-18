import { Star, MessageSquare } from 'lucide-react';
import { DETAILED_TESTIMONIALS } from '../data';

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#FAF9F6] border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-serif italic text-zinc-500 text-base sm:text-lg mb-2">Kisah Nyata, Kebahagiaan Bersama</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#2D2D2D] tracking-tight leading-[1.2]">
            Dicintai oleh banyak pasangan bahagia
          </h2>
          <p className="mt-4 text-[#6B6B6B] text-[0.9375rem] sm:text-sm font-sans tracking-wide leading-[1.6]">
            Baca bagaimana para pasangan mendesain jalur digital kustom untuk menyederhanakan komunikasi tamu dan mengabadikan kenangan tak terlupakan.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {DETAILED_TESTIMONIALS.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl p-6 sm:p-10 border border-[#E5E2D9] shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              {/* Star ratings */}
              <div className="flex gap-1 mb-6">
                {[...Array(test.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                ))}
              </div>

              {/* Quote text */}
              <blockquote className="font-serif text-[#2D2D2D] text-base sm:text-lg italic leading-[1.6] mb-6">
                "{test.quote}"
              </blockquote>

              {/* Author and metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-zinc-100 mt-auto">
                <div>
                  <h4 className="font-serif italic text-zinc-900 text-sm tracking-wide leading-[1.4]">
                    {test.author}
                  </h4>
                  <p className="text-zinc-400 text-xs tracking-wide font-mono uppercase mt-0.5">
                    {test.role}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs bg-[#C5A059]/10 text-[#C5A059] px-3 py-1 rounded-full font-mono tracking-wide uppercase font-medium whitespace-nowrap">
                    {test.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Highlight trust signal */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 max-w-xs sm:max-w-none mx-auto bg-[#C5A059]/5 px-4 py-3 sm:py-2 border border-[#C5A059]/20 rounded-2xl sm:rounded-full text-xs text-[#C5A059] font-sans font-bold tracking-tight sm:tracking-widest uppercase leading-[1.5] text-center">
            <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
            NILAI KLIEN KESELURUHAN BINTANG 4.9 / 5.0 DI SELURUH 1.200+ PERNIKAHAN PADA TAHUN 2025
          </div>
        </div>

      </div>
    </section>
  );
}
