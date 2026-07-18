import { Sparkles } from 'lucide-react';

export default function Marquee() {
  const marqueeText = [
    'DINOBATKAN SEBAGAI "TEMPAT TERBAIK UNTUK UNDANGAN PERNIKAHAN DIGITAL" OLEH BRIDES',
    'DIPILIH SEBAGAI "DESAIN PERNIKAHAN PALING BERKELANJUTAN" OLEH VOGUE',
    'DINOBATKAN SEBAGAI "WEBSITE PERNIKAHAN EDITORIAL TERBAIK" OLEH CHERRY',
    'DIPILIH SEBAGAI "PILIHAN ADIBUSANA EDITOR" OLEH MODERN BRIDE',
  ];

  // Repeat text to make sure the loop is seamless
  const repeatedText = [...marqueeText, ...marqueeText, ...marqueeText];

  return (
    <div className="relative w-full overflow-hidden bg-[#E5E2D9]/80 py-3.5 border-y border-[#D6D1C4] select-none">
      {/* Custom Marquee Scrolling Style */}
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333%, 0, 0); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="animate-marquee whitespace-nowrap flex items-center gap-16">
        {repeatedText.map((text, idx) => (
          <div key={idx} className="inline-flex items-center gap-3 text-[#2D2D2D] text-xs sm:text-sm font-sans tracking-[0.1em] sm:tracking-[0.2em] font-medium whitespace-nowrap">
            <span>{text}</span>
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059] animate-pulse fill-[#C5A059]/15 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
