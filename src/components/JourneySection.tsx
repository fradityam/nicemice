import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { JOURNEY_STEPS } from '../data';

export default function JourneySection() {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const carouselRef = useRef<HTMLDivElement>(null);

  const toggleTask = (taskKey: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-[#FAF9F6] border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <p className="font-serif italic text-zinc-500 text-lg mb-2">Langkah indah yang berkesan</p>
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2D2D2D] tracking-tight leading-none">
              Hadir untuk setiap langkah perjalanan Anda
            </h2>
            <p className="mt-4 text-zinc-500 text-sm tracking-wide leading-relaxed font-sans">
              Dari hari pertama mencari inspirasi, hingga log RSVP terakhir beberapa minggu sebelum janji suci Anda. Centang tugas di bawah untuk memvisualisasikan linimasa Anda.
            </p>
          </div>

          <div className="flex-shrink-0">
            <a
              href="#planning-guide"
              className="inline-block bg-[#2D2D2D] hover:bg-[#C5A059] text-white font-sans font-bold text-xs tracking-widest uppercase px-6 py-4 rounded-sm transition-colors cursor-pointer"
            >
              UNDUH PANDUAN PERENCANAAN TERBAIK KAMI
            </a>
          </div>
        </div>

        {/* Chronological Grid / Sliding Carousel Container */}
        <div className="relative">
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {JOURNEY_STEPS.map((step, stepId) => (
              <div
                key={step.timeline}
                className="flex-shrink-0 w-[300px] sm:w-[320px] bg-white border border-zinc-150 rounded-2xl p-6 sm:p-8 snap-start flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Horizontal flow connection helper line */}
                {stepId < JOURNEY_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-6 h-0.5 bg-dashed bg-zinc-200 z-10" />
                )}

                <div>
                  {/* Timeline Badge */}
                  <span className="inline-block font-mono text-[10px] font-bold tracking-[0.25em] text-[#C5A059] mb-4 bg-amber-50 px-3 py-1 rounded-sm">
                    {step.timeline}
                  </span>

                  {/* Title */}
                  <h3 className="font-display font-semibold text-lg text-zinc-950 tracking-wide mb-6 leading-snug">
                    {step.title}
                  </h3>

                  {/* Interactive Checklist */}
                  <ul className="space-y-4">
                    {step.checklist.map((task, idx) => {
                      const taskKey = `${stepId}-${idx}`;
                      const isComplete = completedTasks[taskKey];
                      return (
                        <li
                          key={idx}
                          onClick={() => toggleTask(taskKey)}
                          className="flex items-start gap-3 cursor-pointer group select-none text-left"
                        >
                          <div
                            className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${
                              isComplete
                                ? 'bg-[#C5A059] border-[#C5A059] text-white'
                                : 'border-zinc-300 group-hover:border-zinc-500'
                            }`}
                          >
                            {isComplete && <Check className="w-3 h-3" />}
                          </div>
                          <span
                            className={`text-xs tracking-wide leading-relaxed font-sans transition-colors ${
                              isComplete
                                ? 'text-zinc-400 line-through'
                                : 'text-zinc-600 group-hover:text-zinc-900'
                            }`}
                          >
                            {task}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* completion count footer helper */}
                <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono tracking-widest text-zinc-400 font-bold uppercase">
                  <span>KEMAJUAN</span>
                  <span>
                    {step.checklist.filter((_, idx) => completedTasks[`${stepId}-${idx}`]).length} /{' '}
                    {step.checklist.length} SELESAI
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Arrows Bottom Panel and Right Arrow Controls */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => scroll('left')}
              className="p-2.5 rounded-full border border-zinc-200 hover:border-zinc-400 bg-white/80 text-zinc-600 hover:text-zinc-950 transition-colors shadow-sm cursor-pointer"
              aria-label="Scroll left timeline"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2.5 rounded-full border border-zinc-200 hover:border-zinc-400 bg-white/80 text-zinc-600 hover:text-zinc-950 transition-colors shadow-sm cursor-pointer"
              aria-label="Scroll right timeline"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
