import weddingCouple from '../../assets/images/home/wedding-couple.webp';
import { ArrowIcon, HeartIcon, SparkIcon } from './icons';

export default function Hero() {
  return (
    <section className="hero" id="beranda">
      <div className="hero-copy">
        <p className="eyebrow">Undangan pernikahan digital</p>
        <h1>
          Ceritakan Hari Bahagiamu Lewat Undangan yang <em>Kamu Banget</em>
        </h1>
        <p className="hero-description">
          Setiap pasangan punya cerita perjalanan cinta yang unik. Yuk, temukan tema yang paling
          cocok untuk menceritakan kisah kalian di sini!
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#tema">
            Lihat tema
            <ArrowIcon />
          </a>
          <a className="text-link" href="#cara-pesan">
            Cara memesan
          </a>
        </div>
        <div className="hero-note">
          <span className="heart-mini">
            <HeartIcon />
          </span>
          <span>
            Dikerjakan dengan hati
            <small>oleh tim kreatif Nice Mice</small>
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
          <span className="photo-caption">Kisahmu, selamanya!</span>
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
