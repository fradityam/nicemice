import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

const navLinks = [
  { label: 'Katalog Tema', href: '/#templates' },
  { label: 'Fitur', href: '/#fitur' },
  { label: 'Harga', href: '/harga' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="relative border-b border-[#E5E2D9] bg-[#FAF9F6] font-sans tracking-wide sm:tracking-widest text-xs z-50">
      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#1A1A1A] group">
              nice<span className="text-[#C5A059] italic font-light group-hover:text-zinc-600 transition-colors">mice</span>
            </a>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            {navLinks.map((link) => {
              const isActive = !link.href.includes('#') && pathname === link.href;
              const linkClassName = `font-medium tracking-[0.12em] text-[10px] xl:text-xs transition-colors py-2 relative group ${
                isActive ? 'text-[#1A1A1A]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
              }`;
              return link.href.includes('#') ? (
                <a key={link.label} href={link.href} className={linkClassName}>
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C5A059] transition-all duration-300 group-hover:w-full"></span>
                </a>
              ) : (
                <Link key={link.label} to={link.href} className={linkClassName}>
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-[#C5A059] transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </Link>
              );
            })}
          </nav>

          {/* CTA button */}
          <div className="hidden lg:flex items-center">
            <a
              href="/#templates"
              className="bg-[#C5A059] hover:bg-[#b08c4a] text-white font-medium text-[10px] tracking-widest px-5 py-2.5 rounded-full transition-all flex items-center gap-1 cursor-pointer"
            >
              BUAT UNDANGAN <ArrowRight className="w-3.5 h-3.5" />
            </a>
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
            {navLinks.map((link) => {
              const isActive = !link.href.includes('#') && pathname === link.href;
              const linkClassName = `block px-3 py-3 rounded-md text-sm font-medium tracking-wide leading-[1.5] ${
                isActive ? 'text-[#1A1A1A] bg-zinc-100/70' : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-zinc-100/50'
              }`;
              return link.href.includes('#') ? (
                <a key={link.label} href={link.href} className={linkClassName} onClick={() => setIsOpen(false)}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} to={link.href} className={linkClassName} onClick={() => setIsOpen(false)}>
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-[#E5E2D9] pt-4 pb-2 px-3 flex flex-col gap-3">
              <a
                href="/#templates"
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#C5A059] hover:bg-[#b08c4a] text-white font-medium text-xs tracking-wide px-4 py-3 rounded-full transition-all flex items-center justify-center gap-2"
              >
                BUAT UNDANGAN <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
