import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'SITUS PERNIKAHAN', href: '#websites' },
    { label: 'DAFTAR HADIAH', href: '#registry' },
    { label: 'UNDANGAN ONLINE', href: '#invitations' },
    { label: 'LOGO & MONOGRAM', href: '#logos' },
    { label: 'GALERI', href: '#gallery' },
  ];

  return (
    <header className="relative border-b border-[#E5E2D9] bg-[#FAF9F6] font-sans tracking-widest text-[10px] sm:text-xs z-50">
      {/* Top tiny sub-header bar */}
      <div className="flex justify-between items-center px-4 py-2 text-[10px] text-zinc-500 border-b border-[#E5E2D9] font-sans font-medium">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-[#C5A059] rounded-full flex items-center justify-center">
              <span className="text-white font-serif text-[11px] italic">n</span>
            </div>
            <span className="text-zinc-800 font-bold hover:opacity-80 cursor-pointer">nicemice</span>
          </div>
          <span className="text-zinc-300">|</span>
          <span className="hover:text-zinc-900 transition-colors cursor-pointer">CARATS & CAKE</span>
          <span className="text-zinc-300">|</span>
          <span className="hover:text-zinc-900 transition-colors cursor-pointer text-[#C5A059]">CHERRY ✨</span>
        </div>
        <div className="hidden sm:block">
          <span className="text-[#C5A059] font-semibold tracking-widest">● MINIMALISME YANG BERSIH DAN ANGGUN</span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#1A1A1A] group">
              nice<span className="text-[#C5A059] italic font-light group-hover:text-zinc-600 transition-colors">mice</span>
            </a>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[#6B6B6B] hover:text-[#1A1A1A] font-medium tracking-[0.12em] text-[10px] xl:text-xs transition-colors py-2 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C5A059] transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Right auth button */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="text-[#6B6B6B] hover:text-[#1A1A1A] font-semibold tracking-[0.12em] text-[10px] transition-colors">
              MASUK ATAU DAFTAR
            </button>
            <button className="bg-[#2D2D2D] hover:bg-[#C5A059] text-white font-medium text-[10px] tracking-widest px-5 py-2.5 rounded-full transition-all flex items-center gap-1 cursor-pointer">
              BUAT UNDANGAN <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#FAF9F6] border-b border-[#E5E2D9] shadow-lg z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-3 py-3 rounded-md text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-zinc-100/50 tracking-widest"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-[#E5E2D9] pt-4 pb-2 px-3 flex flex-col gap-3">
              <button className="text-left py-2 text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] tracking-widest">
                MASUK ATAU DAFTAR
              </button>
              <button className="w-full bg-[#2D2D2D] hover:bg-[#C5A059] text-white font-medium text-xs tracking-widest px-4 py-3 rounded-full transition-all flex items-center justify-center gap-2">
                BUAT UNDANGAN <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
