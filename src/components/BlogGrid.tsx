import { useState } from 'react';
import { ArrowUpRight, BookOpen, X } from 'lucide-react';
import { BLOG_POSTS } from '../data';

export default function BlogGrid() {
  const [activeToast, setActiveToast] = useState<string | null>(null);

  return (
    <section className="py-24 bg-[#FAF9F6] border-t border-zinc-150/50 relative">
      {/* Toast Modal Notification */}
      {activeToast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 bg-[#2D2D2D] text-white py-4 px-6 rounded-sm shadow-xl z-50 sm:max-w-sm flex items-start gap-3 animate-slide-up border border-[#C5A059]/40">
          <div className="flex-1 min-w-0">
            <p className="text-xs tracking-wide text-[#C5A059] font-bold font-mono mb-1">JURNAL DESAIN EDITORIAL</p>
            <p className="text-xs leading-[1.5] text-zinc-200">
              Membuka artikel: <strong className="text-white">"{activeToast}"</strong>. Tampilan editor segera dimuat...
            </p>
          </div>
          <button onClick={() => setActiveToast(null)} className="text-zinc-400 hover:text-white transition-colors cursor-pointer flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <p className="font-serif italic text-zinc-500 text-base sm:text-lg mb-2">Jurnal desain</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1A1A1A] tracking-tight leading-[1.2]">
              Sumber Daya Utama & Inspirasi
            </h2>
            <p className="mt-4 text-[#6B6B6B] text-[0.9375rem] sm:text-sm tracking-wide leading-[1.6] font-sans">
              Tips kurasi, panduan kata, perencana teknis, dan inspirasi gaya elegan dari tim desain redaksi nicemice.
            </p>
          </div>

          <div className="flex-shrink-0">
            <a
              href="#journal"
              className="inline-flex items-center gap-2 text-zinc-900 border-b-2 border-[#C5A059] font-sans font-medium text-xs tracking-[0.12em] sm:tracking-[0.2em] uppercase pb-1 hover:text-[#C5A059] hover:border-[#C5A059] transition-all cursor-pointer"
            >
              TELUSURI JURNAL DESAIN
              <ArrowUpRight className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
            </a>
          </div>
        </div>

        {/* Blog Post Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl border border-[#E5E2D9] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 group"
            >
              <div>
                {/* Photo Thumbnail */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100 relative">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category top-right pill */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md border border-[#E5E2D9]/40 py-1 px-3.5 rounded-full text-xs tracking-wide font-mono uppercase text-[#C5A059] font-semibold whitespace-nowrap">
                    PANDUAN DESAIN
                  </div>
                </div>

                {/* Body Text */}
                <div className="p-5 sm:p-6">
                  {/* Date & Length */}
                  <div className="flex gap-4 items-center text-xs text-zinc-400 font-mono tracking-wide uppercase mb-3">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif italic text-lg leading-[1.3] text-[#1A1A1A] tracking-wide group-hover:text-[#C5A059] transition-colors cursor-pointer">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-3 text-[#6B6B6B] text-[0.9375rem] tracking-wide leading-[1.6] font-sans line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Footer link clicker */}
              <div className="px-5 sm:px-6 pb-6 pt-2">
                <a
                  href={`#read-${post.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveToast(post.title);
                  }}
                  className="font-sans font-medium text-xs tracking-[0.12em] sm:tracking-[0.2em] uppercase text-[#1A1A1A] hover:text-[#C5A059] transition-colors inline-flex items-center gap-1 group/btn cursor-pointer"
                >
                  Baca selengkapnya
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform text-[#C5A059] flex-shrink-0" />
                </a>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
