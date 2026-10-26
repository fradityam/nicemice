import { useEffect, useRef } from 'react';
import logo from '../../assets/images/home/nicemice-logo.webp';
import { ORDER_MESSAGE } from '../../config';
import { PRICING } from '../../content/homeInfo';
import OrderLink from './OrderLink';
import { ArrowIcon } from './icons';

/** `home` goes before the section links: '' on the homepage, '/' on pages built outside the app (the blog). */
export default function SiteHeader({ home = '' }: { home?: string }) {
  const topRef = useRef<HTMLDivElement>(null);

  // On desktop the announcement bar and nav stick together (see .site-top in home.css). Their
  // height goes into --nm-sticky-height, so anchor jumps and the sticky FAQ heading land below
  // them instead of underneath.
  useEffect(() => {
    const top = topRef.current;
    if (!top) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty('--nm-sticky-height', `${top.offsetHeight}px`);
    });
    observer.observe(top);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--nm-sticky-height');
    };
  }, []);

  return (
    <div className="site-top" ref={topRef}>
      <div className="announcement">
        <span>50 Pasangan Pertama, PROMO {PRICING.regular.price}</span>
        <span className="announcement-dot" aria-hidden="true">•</span>
        <OrderLink className="announcement-link" message={ORDER_MESSAGE} button="top_bar">
          Pesan Sekarang!
        </OrderLink>
      </div>

      <header className="site-header">
        <a className="brand" href={`${home}#beranda`} aria-label="Nice Mice - beranda">
          <img src={logo} alt="nice mice" width={600} height={144} />
        </a>
        <nav aria-label="Navigasi utama">
          <a href={`${home}#tentang`}>Tentang</a>
          <a href={`${home}#tema`}>Tema</a>
          <a href={`${home}#cara-pesan`}>Cara Pesan</a>
          <a href={`${home}#harga`}>Harga</a>
          <a href={`${home}#faq`}>FAQ</a>
        </nav>
        <a className="button button-small button-outline" href={`${home}#tema`}>
          Pilih Tema
          <ArrowIcon />
        </a>
      </header>
    </div>
  );
}
