import logoWhite from '../../assets/images/home/nicemice-logo-white.webp';
import { CONTACT_INSTAGRAM } from '../../config';

/** `home`: as in SiteHeader. */
export default function SiteFooter({ home = '' }: { home?: string }) {
  return (
    <footer>
      <a className="footer-brand" href={`${home}#beranda`} aria-label="Kembali ke atas">
        <img src={logoWhite} alt="nice mice" width={600} height={144} loading="lazy" decoding="async" />
      </a>
      <p>Undangan digital, dirangkai dengan hati.</p>
      <div className="footer-links">
        <a href="/tentang-kami">Tentang Kami</a>
        {CONTACT_INSTAGRAM && (
          <a href={CONTACT_INSTAGRAM} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        )}
        <a href={`${home}#beranda`}>Kembali ke atas ↑</a>
      </div>
      <small>© {new Date().getFullYear()} Nice Mice. Semua hak dilindungi.</small>
    </footer>
  );
}
