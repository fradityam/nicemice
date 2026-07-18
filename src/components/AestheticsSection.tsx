import { useState } from 'react';
import { ArrowRight, ChevronRight, Check, Sparkles, Heart } from 'lucide-react';
import { TEMPLATES } from '../data';
import { Template } from '../types';

export default function AestheticsSection() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [answers, setAnswers] = useState({
    venue: '',
    vibe: '',
    type: ''
  });
  const [quizRecommendation, setQuizRecommendation] = useState<Template | null>(null);

  const aesthetics = [
    {
      name: 'Sederhana & Minimalis',
      tag: 'minimalist',
      imgUrl: 'https://images.unsplash.com/photo-1510076857177-7470068a4407?auto=format&fit=crop&w=600&q=80',
      description: 'Keseimbangan ruang yang tenang, gaya arsitektur elegan, dan nuansa putih pualam yang menawan.'
    },
    {
      name: 'Floral & Taman',
      tag: 'floral',
      imgUrl: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=600&q=80',
      description: 'Ilustrasi cat air yang anggun, detail dedaunan halus, dan warna-warna organik.'
    },
    {
      name: 'Modern & Editorial',
      tag: 'modern',
      imgUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80',
      description: 'Huruf-huruf tebal yang berani, kisi struktural progresif, dan pemutar musik yang modis.'
    },
    {
      name: 'Klasik & Mewah',
      tag: 'vintage',
      imgUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
      description: 'Bingkai megah kerajaan, warna beludru merah tua yang anggun, dan tulisan bergaya warisan klasik.'
    }
  ];

  const startQuiz = () => {
    setShowQuiz(true);
    setQuizStep(1);
    setAnswers({ venue: '', vibe: '', type: '' });
    setQuizRecommendation(null);
  };

  const selectAnswer = (field: 'venue' | 'vibe' | 'type', value: string) => {
    const updated = { ...answers, [field]: value };
    setAnswers(updated);

    if (quizStep < 3) {
      setQuizStep(prev => prev + 1);
    } else {
      // Calculate recommendation based on user vibe/venue choice
      let matchedTag: 'minimalist' | 'floral' | 'modern' | 'vintage' = 'minimalist';
      if (updated.vibe === 'artistic' || updated.venue === 'garden') {
        matchedTag = 'floral';
      } else if (updated.vibe === 'alternative' || updated.venue === 'modern-gallery') {
        matchedTag = 'modern';
      } else if (updated.vibe === 'romantic' || updated.venue === 'manor') {
        matchedTag = 'vintage';
      }

      // Find first matching template
      const match = TEMPLATES.find(t => t.category === matchedTag) || TEMPLATES[0];
      setQuizRecommendation(match);
      setQuizStep(4);
    }
  };

  return (
    <section className="py-24 bg-white border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="font-serif italic text-zinc-500 text-lg mb-2">Temukan karakter visual Anda</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-zinc-950 tracking-tight leading-tight">
              Pilih undangan berdasarkan gaya estetika
            </h2>
          </div>

          <div>
            <button
              onClick={startQuiz}
              className="inline-flex items-center gap-2.5 bg-[#2D2D2D] hover:bg-[#C5A059] text-white font-sans font-medium text-xs tracking-[0.2em] uppercase px-7 py-4 rounded-full transition-all cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059] animate-pulse" />
              TEMUKAN ESTETIKA ANDA
            </button>
          </div>
        </div>

        {/* Aesthetics grid cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {aesthetics.map((style) => (
            <div
              key={style.name}
              className="group cursor-pointer bg-[#FAF9F6] rounded-2xl border border-[#E5E2D9] overflow-hidden shadow-sm hover:shadow-md transition-all duration-500"
            >
              {/* Image Frame */}
              <div className="aspect-[4/3] sm:aspect-square overflow-hidden relative">
                <img
                  src={style.imgUrl}
                  alt={style.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 via-transparent to-transparent opacity-40" />
              </div>

              {/* Text Body */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif italic text-base text-[#1A1A1A] tracking-wide">
                    {style.name}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1.5 transition-transform" />
                </div>
                <p className="mt-2 text-[#6B6B6B] text-xs tracking-wide leading-relaxed font-sans">
                  {style.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* INTELLIGENT INVITATION FINDER QUIZ MODAL */}
      {showQuiz && (
        <div className="fixed inset-0 bg-zinc-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-10 relative overflow-hidden shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowQuiz(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 font-extrabold text-sm"
            >
              ✕
            </button>            {/* Quiz Step Indicators */}
            {quizStep <= 3 && (
              <div className="flex gap-2 justify-center mb-8">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step === quizStep ? 'w-10 bg-[#C5A059]' : 'w-2 bg-zinc-200'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Step 1: Venue Selection */}
            {quizStep === 1 && (
              <div className="space-y-6 animate-fade-in text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] px-2.5 py-1 bg-[#C5A059]/10 rounded-full">
                    PERTANYAAN 1 DARI 3
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-zinc-950 mt-3 tracking-wide leading-snug font-normal">
                    Di mana upacara pernikahan Anda akan diselenggarakan?
                  </h3>
                  <p className="text-zinc-500 text-xs tracking-wide mt-1 font-sans">
                    Ini membantu kami memahami keselarasan ruang & gaya estetika Anda.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { key: 'modern-gallery', title: 'Galeri Seni Industri modern atau Studio Loft' },
                    { key: 'garden', title: 'Kebun Raya berlapisan alam romantis atau Kebun Buah' },
                    { key: 'manor', title: 'Kastel Bersejarah Megah atau Ballroom Kerajaan' },
                    { key: 'beach', title: 'Resor Pantai Tebing yang Sejuk & Minimalis' }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => selectAnswer('venue', opt.key)}
                      className="w-full text-left p-4 rounded-full border border-[#E5E2D9] hover:border-[#C5A059] hover:bg-[#FAF9F6] font-sans text-xs sm:text-sm font-medium tracking-wide text-zinc-700 hover:text-zinc-950 transition-all active:scale-[0.99] cursor-pointer"
                    >
                      {opt.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Vibe Selection */}
            {quizStep === 2 && (
              <div className="space-y-6 animate-fade-in text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] px-2.5 py-1 bg-[#C5A059]/10 rounded-full">
                    PERTANYAAN 2 DARI 3
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-zinc-950 mt-3 tracking-wide leading-snug font-normal">
                    Kata sifat mana yang paling menggambarkan suasana impian Anda?
                  </h3>
                  <p className="text-zinc-500 text-xs tracking-wide mt-1 font-sans">
                    Suasana hati apa yang ingin langsung dirasakan oleh para tamu?
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { key: 'minimal', title: 'Tenang, arsitektural, bersih, kemewahan yang anggun' },
                    { key: 'romantic', title: 'Megah, bergaya klasik, nostalgia penuh sentuhan emas kerajaan' },
                    { key: 'artistic', title: 'Cerah, penuh warna, melimpah dedaunan & bunga, cat air yang lembut' },
                    { key: 'alternative', title: 'Tren terkini, terinspirasi musik, piringan hitam, editorial kontemporer' }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => selectAnswer('vibe', opt.key)}
                      className="w-full text-left p-4 rounded-full border border-[#E5E2D9] hover:border-[#C5A059] hover:bg-[#FAF9F6] font-sans text-xs sm:text-sm font-medium tracking-wide text-zinc-700 hover:text-zinc-950 transition-all active:scale-[0.99] cursor-pointer"
                    >
                      {opt.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Invitation Preference */}
            {quizStep === 3 && (
              <div className="space-y-6 animate-fade-in text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] px-2.5 py-1 bg-[#C5A059]/10 rounded-full">
                    PERTANYAAN 3 DARI 3
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-zinc-950 mt-3 tracking-wide leading-snug font-normal">
                    Apa jenis tata letak tipografi yang Anda sukai?
                  </h3>
                  <p className="text-zinc-500 text-xs tracking-wide mt-1 font-sans">
                    Bentuk huruf menentukan keanggunan pesan korespondensi pernikahan.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { key: 'serif', title: 'Serif Klasik yang Megah / Playfair Display' },
                    { key: 'cursive', title: 'Tulisan Kaligrafi Kursif yang Anggun' },
                    { key: 'sans', title: 'Sans-Serif Bersih Modern & Kisi Swiss' },
                    { key: 'dynamic', title: 'Simbol Huruf Melingkar & Piringan Musik yang Ceria' }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => selectAnswer('type', opt.key)}
                      className="w-full text-left p-4 rounded-full border border-[#E5E2D9] hover:border-[#C5A059] hover:bg-[#FAF9F6] font-sans text-xs sm:text-sm font-medium tracking-wide text-zinc-700 hover:text-zinc-950 transition-all active:scale-[0.99] cursor-pointer"
                    >
                      {opt.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Recommendation Results */}
            {quizStep === 4 && quizRecommendation && (
              <div className="text-center space-y-6 animate-fade-in">
                <div>
                  <div className="w-12 h-12 bg-[#FAF9F6] text-[#C5A059] rounded-full flex items-center justify-center mx-auto border border-[#E5E2D9] shadow-inner mb-3">
                    <Heart className="w-5 h-5 fill-[#C5A059] text-[#C5A059]" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-zinc-950 tracking-wide font-normal">
                    Kami menemukan templat yang sempurna untuk Anda
                  </h3>
                  <p className="text-zinc-500 text-xs tracking-wide mt-1 font-sans max-w-sm mx-auto">
                    Berdasarkan tipe tempat impian dan suasana perayaan pernikahan Anda, kami sangat merekomendasikan:
                  </p>
                </div>

                {/* Recommended Card Highlight Case */}
                <div className="p-5 bg-[#FAF9F6] border border-[#E5E2D9] rounded-2xl relative max-w-xs mx-auto">
                  <div className={`aspect-[3/4] rounded-xl shadow-lg relative p-6 text-center ${quizRecommendation.bgColor} ${quizRecommendation.textColor} flex flex-col justify-between`}>
                    <div>
                      <p className="text-[7px] tracking-[0.2em] opacity-60">PERAYAAN PERNIKAHAN</p>
                      <h4 className="font-serif text-lg font-normal tracking-wide mt-4">{quizRecommendation.details.wife} & {quizRecommendation.details.husband}</h4>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono tracking-widest">{quizRecommendation.details.date}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-serif text-sm font-normal text-zinc-900">{quizRecommendation.name}</h4>
                      <span className="text-[9px] bg-[#C5A059]/10 text-[#C5A059] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest font-sans">
                        {quizRecommendation.category}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-[10px] leading-relaxed line-clamp-2">{quizRecommendation.subtitle}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowQuiz(false);
                      // Trigger preview on parent showcase
                      const element = document.getElementById('invitations');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full bg-[#2D2D2D] hover:bg-[#C5A059] text-white font-sans font-medium text-xs tracking-[0.2em] uppercase py-3.5 rounded-full transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    LIHAT DI HALAMAN UTAMA
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setQuizStep(1)}
                    className="text-zinc-500 hover:text-zinc-800 font-sans font-medium text-[10px] tracking-[0.2em] uppercase transition-colors"
                  >
                    ULANGI KUIS
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </section>
  );
}
