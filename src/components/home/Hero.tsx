import weddingCouple from '../../assets/images/home/wedding-couple.webp';
import { ArrowIcon, HeartIcon, SparkIcon } from './icons';

export default function Hero() {
  return (
    <section className="hero" id="beranda">
      <div className="hero-copy">
        <p className="eyebrow">Undangan digital untuk cerita yang cuma satu</p>
        <h1>
          Hari bahagia, dimulai dari undangan yang terasa <em>kalian.</em>
        </h1>
        <p className="hero-description">
          Wedding website yang cantik, hangat, dan mudah digunakan. Pilih desain favoritmu, kirim
          detail acara, lalu kami siapkan hingga siap dibagikan.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#template">
            Lihat template
            <ArrowIcon />
          </a>
          <a className="text-link" href="#cara-kerja">
            Cara memesan
          </a>
        </div>
        <div className="hero-note">
          <span className="heart-mini">
            <HeartIcon />
          </span>
          <span>
            Dikerjakan dengan hati
            <small>oleh tim kreatif nice mice</small>
          </span>
        </div>
      </div>

      <div className="hero-art" role="group" aria-label="Contoh pasangan dan undangan digital">
        <div className="sun-shape" />
        <div className="photo-frame">
          <img
            src={weddingCouple}
            alt="Pasangan pengantin tersenyum bersama"
            width={1000}
            height={1501}
            fetchPriority="high"
          />
          <span className="photo-caption">Cerita mereka, selamanya.</span>
        </div>
        <div className="invitation-card">
          <span className="invitation-label">THE WEDDING OF</span>
          <strong>Raka &amp; Nadine</strong>
          <span className="invitation-date">14 · 02 · 2027</span>
          <span className="invitation-line" />
          <small>Jakarta, Indonesia</small>
        </div>
        <div className="spark-sticker">
          <SparkIcon />
        </div>
        <div className="round-sticker">
          <span>dibuat</span>
          <strong>khusus</strong>
          <span>untukmu</span>
        </div>
        <svg className="hero-scribble" viewBox="0 0 180 90" aria-hidden="true">
          <path d="M8 68c38-60 77-70 116-22 18 23 35 12 48-2" />
          <path d="m152 35 21 9-13 18" />
        </svg>
      </div>
    </section>
  );
}
