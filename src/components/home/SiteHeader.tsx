import logo from '../../assets/images/home/nicemice-logo.webp';
import { ArrowIcon } from './icons';

export default function SiteHeader() {
  return (
    <>
      <div className="announcement">
        <span>Slot pengerjaan sudah dibuka</span>
        <span className="announcement-dot" aria-hidden="true">•</span>
        <a href="#mulai">Amankan tanggalmu</a>
      </div>

      <header className="site-header">
        <a className="brand" href="#beranda" aria-label="nice mice — beranda">
          <img src={logo} alt="nice mice" width={600} height={144} />
        </a>
        <nav aria-label="Navigasi utama">
          <a href="#tentang">Tentang</a>
          <a href="#contoh">Fitur</a>
          <a href="#cara-kerja">Cara kerja</a>
        </nav>
        <a className="button button-small button-outline" href="#mulai">
          Pilih template
          <ArrowIcon />
        </a>
      </header>
    </>
  );
}
