import weddingCouple from '../../assets/images/home/wedding-couple.webp';
import { ArrowIcon, CheckIcon, HeartIcon } from './icons';

const FEATURES = [
  'Sampul dan hitung mundur acara',
  'Kisah perjalanan kalian',
  'Detail lokasi dan peta',
  'RSVP dan ucapan tamu',
  'Amplop digital',
];

export default function Showcase() {
  return (
    <section className="showcase" id="contoh">
      <div className="showcase-copy">
        <p className="section-kicker section-kicker-light">Satu halaman, lengkap</p>
        <h2>Semua cerita dan detail hari istimewamu, dalam satu tautan.</h2>
        <ul>
          {FEATURES.map((item) => (
            <li key={item}>
              <CheckIcon />
              {item}
            </li>
          ))}
        </ul>
        <a className="button button-light" href="#mulai">
          Pesan template
          <ArrowIcon />
        </a>
      </div>

      {/* A mock of an invitation website; its button is decoration only. */}
      <div className="browser-card">
        <div className="browser-bar">
          <span />
          <span />
          <span />
          <small>nicemice.id/raka-nadine</small>
        </div>
        <div className="browser-content">
          <div className="browser-photo">
            <img
              src={weddingCouple}
              alt="Foto pasangan pengantin pada contoh undangan digital"
              width={1000}
              height={1501}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="browser-copy">
            <span>We’re getting married</span>
            <strong>Raka</strong>
            <i>&amp;</i>
            <strong>Nadine</strong>
            <p>Minggu, 14 Februari 2027</p>
            <button type="button" tabIndex={-1} aria-hidden="true">
              Buka undangan
            </button>
          </div>
        </div>
        <div className="browser-sticker">
          <HeartIcon />
        </div>
      </div>
    </section>
  );
}
