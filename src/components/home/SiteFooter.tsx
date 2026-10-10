import logoWhite from '../../assets/images/home/nicemice-logo-white.webp';
import { CONTACT_INSTAGRAM } from '../../config';

export default function SiteFooter() {
  return (
    <footer>
      <a className="footer-brand" href="#beranda" aria-label="Kembali ke atas">
        <img src={logoWhite} alt="nice mice" width={600} height={144} loading="lazy" decoding="async" />
      </a>
      <p>Undangan digital, dirangkai dengan hati.</p>
      <div className="footer-links">
        {CONTACT_INSTAGRAM && (
          <a href={CONTACT_INSTAGRAM} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        )}
        <a href="#beranda">Kembali ke atas ↑</a>
      </div>
      <small>© {new Date().getFullYear()} nicemice. Semua hak dilindungi.</small>
    </footer>
  );
}
