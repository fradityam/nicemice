import React, { useState } from 'react';
import { Eye, MessageCircle, RefreshCw, Smartphone, Monitor, Disc, Check, Heart, Mail } from 'lucide-react';
import { TEMPLATES } from '../data';
import { Template } from '../types';

export default function TemplateShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'minimalist' | 'floral' | 'modern' | 'vintage'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [guestName, setGuestName] = useState('John Doe & Partner');
  const [activeAccColor, setActiveAccColor] = useState('#D4AF37');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderTemplate, setOrderTemplate] = useState<Template | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState<string | null>(null);

  // Filter templates
  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(item => item.category === selectedCategory);

  const openPreview = (tpl: Template) => {
    setSelectedTemplate(tpl);
    setActiveAccColor(tpl.details.accentColor || '#D4AF37');
    setPreviewDevice('mobile');
    setIsMusicPlaying(false);
  };

  const submitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitted(true);
    setTimeout(() => {
      setOrderSubmitted(false);
      setShowOrderModal(false);
      setCustomerName('');
      setGuestContact('');
    }, 2800);
  };

  // Renderer for specific template preview inside the showcase cards
  const renderCardTheme = (tpl: Template) => {
    const d = tpl.details;
    switch (tpl.previewType) {
      case 'grid':
        return (
          <div className="flex flex-col items-center justify-center h-full font-serif p-6 space-y-4 text-center select-none">
            <p className="text-[10px] tracking-[0.2em] opacity-60">PERNIKAHAN DARI</p>
            <div className="text-xl sm:text-2xl font-semibold tracking-[0.3em] font-display uppercase leading-relaxed">
              <div>{d.wife[0]} {d.wife[1]}</div>
              <div className="text-zinc-500 font-light text-base my-1">&</div>
              <div>{d.husband[0]} {d.husband[1]}</div>
            </div>
            <div className="w-10 h-px bg-zinc-400 my-2"></div>
            <p className="text-xs tracking-[0.15em] font-sans opacity-80">{d.date}</p>
          </div>
        );
      case 'circular':
        return (
          <div className="flex flex-col items-center justify-center h-full p-4 relative select-none">
            {/* Spinning decorative text ring */}
            <div className="absolute w-44 h-44 rounded-full border border-dashed border-zinc-300 flex items-center justify-center animate-[spin_40s_linear_infinite]">
              <div className="absolute text-[8px] font-sans tracking-[0.16em] uppercase text-zinc-400">
                SAVE THE DATE • MENUJU HARI BAHAGIA • 12.11.2026 •
              </div>
            </div>
            <div className="z-10 text-center text-zinc-800">
              <p className="font-serif italic text-2xl font-light">{d.wife}</p>
              <p className="text-xs font-serif italic my-1 opacity-50">&</p>
              <p className="font-serif italic text-2xl font-light">{d.husband}</p>
              <p className="text-[9px] font-sans tracking-[0.2em] uppercase mt-2 opacity-60">{d.date}</p>
            </div>
          </div>
        );
      case 'record':
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center select-none relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-zinc-950 flex items-center justify-center text-white border-4 border-zinc-800/20 shadow-md">
              <Disc className="w-12 h-12 text-[#C5A059]/60 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div className="text-left w-full space-y-2 z-10 self-start">
              <span className="text-[9px] px-2 py-0.5 bg-[#C5A059]/15 rounded-sm tracking-widest font-mono uppercase text-[#C5A059]">
                SIDE A
              </span>
              <h4 className="font-display text-lg font-bold tracking-wider text-[#C5A059] uppercase">
                {d.wife} & {d.husband}
              </h4>
              <p className="text-xs font-sans tracking-wide opacity-80">{d.location}</p>
              <p className="text-[10px] font-mono tracking-widest text-[#C5A059] mt-4">{d.date}</p>
            </div>
          </div>
        );
      case 'floral-panel':
        return (
          <div className="w-full h-full p-5 relative flex flex-col justify-between border border-zinc-200/50 rounded-lg select-none">
            {/* Double arch lines to represent theme 16 */}
            <div className="absolute inset-2 border border-zinc-300/30 rounded" />
            <div className="absolute inset-4 border border-zinc-300/40 rounded flex flex-col items-center justify-center p-4">
              <p className="text-[8px] font-sans tracking-[0.2em] opacity-60 mb-2">DENGAN HORMAT KAMI MENGUNDANG ANDA DI PERNIKAHAN DARI</p>
              <h4 className="font-serif italic text-3xl font-light tracking-wide">{d.wife}</h4>
              <p className="font-serif italic text-lg my-1 opacity-40">&</p>
              <h4 className="font-serif italic text-3xl font-light tracking-wide">{d.husband}</h4>
              <div className="w-8 h-px bg-zinc-300 my-3"></div>
              <p className="text-[9px] font-sans tracking-widest uppercase">{d.date}</p>
            </div>
          </div>
        );
      default:
        // standard elegant typography portrait
        return (
          <div className="flex flex-col justify-between h-full p-6 relative select-none">
            <div className="border-l border-zinc-300/20 pl-4 space-y-2">
              <p className="text-[9px] tracking-[0.2em] opacity-60 uppercase">PERAYAAN PERNIKAHAN</p>
              <h3 className="font-display text-2xl font-bold tracking-widest uppercase">{d.wife}</h3>
              <p className="font-serif text-lg italic opacity-40">&</p>
              <h3 className="font-display text-2xl font-bold tracking-widest uppercase">{d.husband}</h3>
            </div>
            <div className="mt-8">
              <p className="text-[10px] font-mono tracking-widest uppercase opacity-70 mb-1">{d.date}</p>
              <p className="text-[9px] tracking-wider opacity-60 line-clamp-1">{d.location}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <section id="invitations" className="py-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Headings */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-serif italic text-zinc-500 text-lg mb-2">Didesain untuk pasangan modern</p>
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight leading-none">
            Jelajahi pilihan templat terbaik kami
          </h2>
          <p className="mt-4 text-zinc-500 text-sm tracking-wide font-sans leading-relaxed">
            Dirancang dengan indah, sangat interaktif, dan dioptimalkan secara sempurna untuk seluler, desktop, dan tablet.
            Pilih desain apa pun dan sesuaikan warna, tipografi, atau rincian konten Anda.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-12">
          {(['all', 'minimalist', 'floral', 'modern', 'vintage'] as const).map((category) => {
            const categoryLabels: Record<string, string> = {
              all: 'SEMUA TEMA',
              minimalist: 'MINIMALIS',
              floral: 'FLORAL',
              modern: 'MODERN',
              vintage: 'KLASIK',
            };
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full text-xs font-sans tracking-[0.2em] uppercase font-medium transition-all duration-300 border ${
                  selectedCategory === category
                    ? 'bg-[#2D2D2D] border-[#2D2D2D] text-white shadow-sm'
                    : 'bg-white border-[#E5E2D9] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#C5A059]'
                }`}
              >
                {categoryLabels[category]}
              </button>
            );
          })}
        </div>

        {/* Grid of templates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="group bg-white rounded-2xl border border-zinc-150/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card visual showcase */}
              <div className="p-4 bg-zinc-50 border-b border-zinc-100">
                <div
                  className={`aspect-[3/4] w-full rounded-xl overflow-hidden shadow-sm border border-zinc-950/5 relative transition-transform duration-300 group-hover:scale-[1.02] ${tpl.bgColor} ${tpl.textColor}`}
                >
                  {renderCardTheme(tpl)}
                </div>
              </div>

              {/* Card descriptions & actions */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-sans tracking-widest font-bold text-xs text-zinc-950">
                      {tpl.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold tracking-widest text-[#C5A059] px-2.5 py-0.5 bg-[#C5A059]/10 rounded-full font-sans">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-[10px] font-sans text-zinc-400 uppercase tracking-widest font-medium mb-3 line-clamp-1 block">
                    {tpl.code}
                  </p>
                  <p className="text-zinc-500 text-xs tracking-wide line-clamp-2 leading-relaxed">
                    {tpl.subtitle}
                  </p>
                </div>

                {/* Indonesian/mockup matching buttons: Contoh and Pesan */}
                <div className="grid grid-cols-2 gap-3 mt-6 border-t border-[#E5E2D9] pt-4">
                  <button
                    onClick={() => openPreview(tpl)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#FAF9F6] hover:bg-[#E5E2D9]/40 border border-[#E5E2D9] text-[#2D2D2D] rounded-sm font-sans font-medium text-[10px] tracking-widest uppercase transition-all active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                    Contoh
                  </button>
                  <button
                    onClick={() => { setOrderTemplate(tpl); setShowOrderModal(true); }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#2D2D2D] hover:bg-[#C5A059] text-white border border-transparent rounded-sm font-sans font-medium text-[10px] tracking-widest uppercase transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Pesan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action stripe (luxury gold-neutral stripe right below mockups) */}
        <div className="relative bg-[#E5E2D9]/80 rounded-3xl p-8 sm:p-12 text-[#2D2D2D] overflow-hidden border border-[#D6D1C4] shadow-sm">
          {/* Subtle nature circle patterns in background */}
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full border border-[#2D2D2D]/5 pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full border border-[#2D2D2D]/5 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight leading-tight">
                Website pernikahan gratis
              </h3>
              <p className="mt-2 text-[#6B6B6B] text-[13px] sm:text-sm tracking-wide font-sans max-w-xl leading-relaxed">
                Mudah dibuat, mudah disesuaikan, dan sangat mudah digunakan oleh tamu Anda. Hubungkan RSVP, peta lokasi, dan daftar hadiah secara elegan.
              </p>
            </div>

            <div className="flex-shrink-0">
              <a
                href="#try-free"
                className="inline-block bg-[#2D2D2D] text-white hover:bg-[#C5A059] font-sans font-medium text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-sm shadow-sm hover:scale-105 active:scale-95 transition-all"
              >
                MULAI BUAT GRATIS
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* RETAIL PREVIEW MODAL (Contoh) */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[92vh] max-h-[820px] overflow-hidden flex flex-col lg:flex-row">
            
            {/* Left Control Panel */}
            <div className="lg:w-[320px] bg-[#FAF9F6] border-r border-[#E5E2D9] p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase font-semibold tracking-widest text-[#C5A059] px-2.5 py-0.5 bg-[#C5A059]/10 rounded-full font-sans">
                    PRATINJAU UNDANGAN
                  </span>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="p-1 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors lg:hidden text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>
                
                <h3 className="font-display font-bold text-zinc-950 text-lg uppercase tracking-wider">{selectedTemplate.name}</h3>
                <p className="text-[10px] font-mono tracking-wider opacity-60 mt-1">{selectedTemplate.code}</p>

                <div className="h-px bg-zinc-200 my-4" />

                {/* Edit Guest Name Input */}
                <div className="space-y-2 mb-6">
                  <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    TULIS NAMA TAMU
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 font-sans focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    placeholder="Masukkan nama tamu..."
                  />
                  <p className="text-[9px] text-zinc-400 italic">Kolom ini mengubah nama tamu secara langsung pada templat utama.</p>
                </div>

                {/* Color theme selectors */}
                <div className="space-y-2 mb-6">
                  <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    PILIH SKEMA WARNA
                  </label>
                  <div className="flex gap-2">
                    {['#D4AF37', '#8C7A5B', '#435C3E', '#825F4C', '#A89F91', '#4B0F15'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setActiveAccColor(color)}
                        className="w-6 h-6 rounded-full border border-white hover:scale-110 active:scale-95 shadow-sm transition-transform cursor-pointer relative"
                        style={{ backgroundColor: color }}
                      >
                        {activeAccColor === color && (
                          <Check className="w-3 h-3 text-white absolute inset-1.5 flex items-center justify-center" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulation controls */}
                <div className="space-y-3 mb-6">
                  <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    AUDIO PERNIKAHAN
                  </label>
                  <button
                    onClick={() => setIsMusicPlaying(!isMusicPlaying)}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 border rounded-lg text-xs font-medium tracking-[0.15em] uppercase transition-all ${
                      isMusicPlaying
                        ? 'bg-[#C5A059] text-white border-[#C5A059]'
                        : 'bg-white border-[#E5E2D9] text-[#2D2D2D] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <Disc className={`w-4 h-4 ${isMusicPlaying ? 'animate-spin' : ''}`} />
                    {isMusicPlaying ? 'AUDIO AKTIF' : 'UJI SUARA LATAR'}
                  </button>
                </div>

                {/* Layout simulation switch */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    SIMULASI LAYAR
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-200/60 rounded-lg">
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all ${
                        previewDevice === 'mobile' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Seluler
                    </button>
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all ${
                        previewDevice === 'desktop' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      Desktop
                    </button>
                  </div>
                </div>
              </div>

              {/* Order quick link from modal */}
              <div className="pt-4 border-t border-[#E5E2D9] mt-6 lg:mt-0">
                <button
                  onClick={() => {
                    const temp = selectedTemplate;
                    setSelectedTemplate(null);
                    setOrderTemplate(temp);
                    setShowOrderModal(true);
                  }}
                  className="w-full bg-[#2D2D2D] hover:bg-[#C5A059] text-white font-sans font-medium text-[10px] tracking-[0.2em] uppercase py-3 rounded-sm transition-all shadow-md cursor-pointer"
                >
                  GUNAKAN TEMPLAT INI
                </button>
              </div>
            </div>

            {/* Right Live Simulation Canvas Frame */}
            <div className="flex-1 bg-zinc-100 p-3 sm:p-6 flex items-center justify-center relative overflow-hidden">
              
              {/* Close Button Desktop */}
              <button
                onClick={() => setSelectedTemplate(null)}
                className="hidden lg:flex absolute top-6 right-6 w-10 h-10 rounded-full bg-white shadow-md border border-zinc-200 items-center justify-center hover:scale-105 active:scale-95 text-zinc-400 hover:text-zinc-800 transition-transform cursor-pointer"
              >
                ✕
              </button>

              {/* Interactive preview box wrapper */}
              <div
                className={`transition-all duration-500 ease-out flex items-center justify-center ${
                  previewDevice === 'mobile'
                    ? 'w-[320px] h-[550px] rounded-[40px] border-[8px] border-zinc-900 shadow-2xl relative bg-white overflow-hidden'
                    : 'w-full h-full max-h-[500px] rounded-2xl border border-zinc-200 shadow-xl bg-white overflow-hidden'
                }`}
              >
                {/* Simulated mobile status notch */}
                {previewDevice === 'mobile' && (
                  <div className="absolute top-0 inset-x-0 h-5 bg-zinc-900 z-30 flex justify-center items-center">
                    <div className="w-24 h-4 bg-zinc-950 rounded-b-xl" />
                  </div>
                )}

                {/* Rendered Invitation Body */}
                <div
                  className={`w-full h-full overflow-y-auto flex flex-col justify-between pt-8 pb-10 px-6 sm:px-8 relative selection:bg-zinc-200 transition-all ${
                    selectedTemplate.bgColor
                  } ${selectedTemplate.textColor}`}
                >
                  {/* Small decorative corner accents to make it ultra premium */}
                  <div className="absolute top-4 left-4 text-xs opacity-20 transform rotate-0">✦</div>
                  <div className="absolute top-4 right-4 text-xs opacity-20 transform rotate-90">✦</div>
                  <div className="absolute bottom-4 left-4 text-xs opacity-20 transform rotate-[270deg]">✦</div>
                  <div className="absolute bottom-4 right-4 text-xs opacity-20 transform rotate-180">✦</div>

                  {/* Body Content */}
                  <div className="my-auto text-center py-6">
                    <p className="text-[9px] tracking-[0.25em] font-sans uppercase opacity-60 mb-1">
                      PERNIKAHAN DARI
                    </p>

                    <div className="font-display tracking-[0.08em] my-6 font-bold leading-none">
                      <h4 className="text-3xl sm:text-4xl text-inherit uppercase">{selectedTemplate.details.wife}</h4>
                      <p className="font-serif italic text-2xl font-light text-zinc-500/80 my-3 select-none">&</p>
                      <h4 className="text-3xl sm:text-4xl text-inherit uppercase">{selectedTemplate.details.husband}</h4>
                    </div>

                    <div className="h-px w-14 bg-zinc-400/30 mx-auto my-6" />

                    <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 max-w-xs mx-auto leading-relaxed mb-8">
                      {selectedTemplate.details.date}
                    </p>

                    {/* Personal Guest Invite Box (The main highlight of digital invitations) */}
                    <div className="bg-white/5 border border-white/10 p-5 rounded-xl max-w-xs mx-auto my-6 font-sans">
                      <span className="text-[8px] tracking-[0.16em] uppercase opacity-50 block mb-1.5">
                        UNTUK TAMU SPESIAL
                      </span>
                      <h5 className="font-serif text-base italic font-semibold" style={{ color: activeAccColor }}>
                        {guestName}
                      </h5>
                      <span className="text-[8px] tracking-[0.15em] uppercase opacity-40 block mt-2 text-zinc-400">
                        KAMI MENGUNDANG ANDA UNTUK MELAKUKAN RSVP DI BAWAH INI
                      </span>
                    </div>

                    <p className="font-serif italic text-xs max-w-xs mx-auto text-zinc-400 leading-relaxed">
                      "{selectedTemplate.details.quote}"
                    </p>
                  </div>

                  {/* Simulated interactive actions inside invitation */}
                  <div className="mt-4 flex flex-col gap-2 max-w-xs mx-auto w-full relative">
                    {rsvpSuccess && (
                      <div className="absolute -top-16 inset-x-0 bg-[#2D2D2D] border border-[#C5A059] text-white text-[10px] py-2 px-3 rounded-sm tracking-wide text-center animate-bounce z-40">
                        {rsvpSuccess}
                      </div>
                    )}
                    <button
                      className="py-2.5 px-4 rounded-sm font-bold text-[9px] tracking-widest uppercase transition-all shadow-sm flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: activeAccColor, color: '#FFFFFF' }}
                      onClick={() => {
                        setRsvpSuccess(`Konfirmasi RSVP Berhasil untuk ${guestName}!`);
                        setTimeout(() => setRsvpSuccess(null), 3000);
                      }}
                    >
                      <Mail className="w-3 h-3" />
                      KONFIRMASI KEHADIRAN
                    </button>
                    <button className="py-2 px-4 rounded-sm border border-zinc-400/20 hover:bg-white/5 font-semibold text-[8px] tracking-widest uppercase transition-colors">
                      PETA LOKASI & ALAMAT
                    </button>
                  </div>

                  {/* Simulated playing audio widget indicator */}
                  {isMusicPlaying && (
                    <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 px-3 py-1.5 rounded-full select-none">
                      <div className="flex gap-0.5 items-end h-3">
                        <div className="w-0.5 bg-[#C5A059] h-2 animate-pulse" />
                        <div className="w-0.5 bg-[#C5A059] h-3 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-0.5 bg-[#C5A059] h-1 animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                      <span className="text-[7px] font-mono tracking-widest text-[#E3ECE6] uppercase animate-pulse">
                        Alunan Musik Syahdu
                      </span>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RECEPTIVE BOOKING FORM MODAL (Pesan) */}
      {showOrderModal && orderTemplate && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => { setShowOrderModal(false); setOrderSubmitted(false); }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 font-extrabold text-sm"
            >
              ✕
            </button>

            {!orderSubmitted ? (
              <form onSubmit={submitOrder} className="space-y-4">
                <div className="text-center mb-6">
                  <Heart className="w-8 h-8 text-[#C5A059] mx-auto mb-2" />
                  <h3 className="font-serif text-lg text-zinc-900 uppercase tracking-widest">
                    Ajukan Kustomisasi Desain
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Pesan sesi desain yang dipersonalisasi untuk {orderTemplate.name}.
                  </p>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 text-xs flex gap-2 items-center">
                  <div className={`w-8 h-10 rounded ${orderTemplate.bgColor} flex items-center justify-center text-white text-[9px] font-bold`}>
                    12
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-800">Paket Desain {orderTemplate.name}</h5>
                    <p className="text-zinc-500 text-[10px] uppercase font-mono">{orderTemplate.code}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase block">
                    Nama Lengkap Anda
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ratu Adelia"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase block">
                    Email atau Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    value={guestContact}
                    onChange={(e) => setGuestContact(e.target.value)}
                    placeholder="Contoh: +62 812-3456-7890 atau email@gmail.com"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full bg-[#2D2D2D] hover:bg-[#C5A059] text-white font-sans font-medium text-xs tracking-[0.2em] uppercase py-3.5 rounded-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    KIRIM RINCIAN PESANAN
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-[#FAF9F6] text-[#C5A059] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E5E2D9] shadow-inner font-serif text-2xl font-bold">
                  ✓
                </div>
                <h4 className="font-serif text-xl text-[#2D2D2D] uppercase tracking-widest leading-none">
                  Pengiriman Berhasil
                </h4>
                <p className="text-xs text-[#6B6B6B] max-w-xs mx-auto leading-relaxed">
                  Terima kasih, <strong>{customerName}</strong>! Tim layanan desainer kami telah menerima permintaan untuk <strong>{orderTemplate.name}</strong> dan akan segera menghubungi Anda melalui <strong>{guestContact}</strong> untuk mendesain tata letak impian Anda.
                </p>
                <div className="flex justify-center items-center gap-2 text-[10px] text-zinc-400 mt-4 animate-pulse uppercase tracking-widest font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
                  Kembali dalam sekejap...
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
}
