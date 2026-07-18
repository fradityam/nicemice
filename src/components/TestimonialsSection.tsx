import { Star, MessageSquare } from 'lucide-react';
import { DETAILED_TESTIMONIALS } from '../data';

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#FAF9F6] border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-serif italic text-zinc-500 text-lg mb-2">Kisah Nyata, Kebahagiaan Bersama</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#2D2D2D] tracking-tight leading-tight">
            Dicintai oleh banyak pasangan bahagia
          </h2>
          <p className="mt-4 text-[#6B6B6B] text-sm font-sans tracking-wide leading-relaxed">
            Baca bagaimana para pasangan mendesain jalur digital kustom untuk menyederhanakan komunikasi tamu dan mengabadikan kenangan tak terlupakan.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {DETAILED_TESTIMONIALS.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl p-8 sm:p-10 border border-[#E5E2D9] shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              {/* Star ratings */}
              <div className="flex gap-1 mb-6">
                {[...Array(test.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                ))}
              </div>

              {/* Quote text */}
              <blockquote className="font-serif text-[#2D2D2D] text-base sm:text-lg italic leading-relaxed mb-6">
                "{test.quote}"
              </blockquote>

              {/* Author and metadata */}
              <div className="flex items-center justify-between pt-6 border-t border-zinc-100 mt-auto">
                <div>
                  <h4 className="font-serif italic text-zinc-900 text-sm tracking-wide">
                    {test.author}
                  </h4>
                  <p className="text-zinc-400 text-[10px] tracking-widest font-mono uppercase mt-0.5">
                    {test.role}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[9px] bg-[#C5A059]/10 text-[#C5A059] px-3 py-1 rounded-full font-mono tracking-widest uppercase font-medium">
                    {test.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Highlight trust signal */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-[#C5A059]/5 px-4 py-2 border border-[#C5A059]/20 rounded-full text-[10px] sm:text-xs text-[#C5A059] font-sans font-bold tracking-widest uppercase">
            <MessageSquare className="w-3.5 h-3.5" />
            NILAI KLIEN KESELURUHAN BINTANG 4.9 / 5.0 DI SELURUH 1.200+ PERNIKAHAN PADA TAHUN 2025
          </div>
        </div>

      </div>
    </section>
  );
}
