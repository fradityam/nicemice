import { useEffect, useRef } from 'react';
import logo from '../../assets/images/home/nicemice-logo.webp';
import { ORDER_MESSAGE } from '../../config';
import { PRICING } from '../../content/homeInfo';
import OrderLink from './OrderLink';
import { ArrowIcon } from './icons';

export default function SiteHeader() {
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
        <OrderLink className="announcement-link" message={ORDER_MESSAGE}>
          Pesan Sekarang!
        </OrderLink>
      </div>

      <header className="site-header">
        <a className="brand" href="#beranda" aria-label="Nice Mice - beranda">
          <img src={logo} alt="nice mice" width={600} height={144} />
        </a>
        <nav aria-label="Navigasi utama">
          <a href="#tentang">Tentang</a>
          <a href="#tema">Tema</a>
          <a href="#cara-pesan">Cara Pesan</a>
          <a href="#harga">Harga</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="button button-small button-outline" href="#tema">
          Pilih Tema
          <ArrowIcon />
        </a>
      </header>
    </div>
  );
}
