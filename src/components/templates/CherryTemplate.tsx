import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Copy, MapPin } from 'lucide-react';

import coverImg from '../../assets/images/cherry/1.png';
import section1Img from '../../assets/images/cherry/page2_section_1.png';
import section2Img from '../../assets/images/cherry/page2_section_2.png';
import section3Img from '../../assets/images/cherry/page2_section_3.png';
import section5Img from '../../assets/images/cherry/page2_section_5 - cropped.png';
import section7Img from '../../assets/images/cherry/page2_section_7.png';

const PINK = '#FFB3C6';
const CREAM = '#FAF7F0';
const TERRACOTTA = '#C1522A';

const EVENT_DATE = new Date('2027-01-08T08:00:00+07:00');
const LOCATION_NAME = 'Gedung Serbaguna ABC';
const LOCATION_ADDRESS = 'Jl. Cempaka No. 18, Kota Bogor, Jawa Barat';
const MAPS_QUERY = encodeURIComponent(`${LOCATION_NAME}, ${LOCATION_ADDRESS}`);

// 1.png (1366x1000) bakes the wavy cream card on Canva's pink export background — and that
// pink (#FFD6DA) is a different shade from the page's own pink (#FFB3C6), so it always shows
// up as a mismatched rectangle no matter how tightly it's cropped. The actual fix isn't a
// tighter crop: below the card, "Kepada Yth."/the guest name/the button were always sitting
// directly on plain pink by design (not on the cream card), so they don't need to be part of
// the image at all. The image is cropped to just the wavy card (pixel-measured bounding box:
// x:[472,877], y:[25,642] of the 1366x1000 export) and the text/button below it are rendered
// as real HTML directly on the page's true pink background, so there's no PNG pink left to
// clash with anything.
const COVER_CARD_CROP = { minX: 472, maxX: 877, minY: 25, maxY: 642, imgW: 1366, imgH: 1000 };
const COVER_CARD_W = COVER_CARD_CROP.maxX - COVER_CARD_CROP.minX;
const COVER_CARD_H = COVER_CARD_CROP.maxY - COVER_CARD_CROP.minY;
const COVER_CARD_IMG_STYLE: React.CSSProperties = {
  position: 'absolute',
  width: `${(COVER_CARD_CROP.imgW / COVER_CARD_W) * 100}%`,
  left: `${-(COVER_CARD_CROP.minX / COVER_CARD_W) * 100}%`,
  top: `${-(COVER_CARD_CROP.minY / COVER_CARD_H) * 100}%`,
  maxWidth: 'none',
};

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now.getTime());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// The Canva export for every page2_section_*.png bakes in a wide pink margin on both
// sides of a centered cream content column. Measured directly from the pixels: the cream
// column runs from x=906 to x=2169 out of a 3074px-wide canvas (width 1263px), identical
// across all six section files. Cropping is done purely in CSS: each <img> is given an
// aspect-ratio equal to (cream column width / full image height), so object-fit: cover
// scales the image until its height fills the box and crops the excess width symmetrically
// (object-position: center) — which lands exactly on the pink margins since they're even
// on both sides. No re-exporting/cropping of the source PNGs required.
const CREAM_COLUMN_WIDTH = 1263;

function FullBleedImage({ src, alt, imageHeight }: { src: string; alt: string; imageHeight: number }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        display: 'block',
        margin: 0,
        padding: 0,
        aspectRatio: `${CREAM_COLUMN_WIDTH} / ${imageHeight}`,
        objectFit: 'cover',
        objectPosition: 'center',
      }}
    />
  );
}

type Attendance = 'Akan Hadir' | 'Mungkin Hadir' | 'Berhalangan Hadir';
const ATTENDANCE_OPTIONS: Attendance[] = ['Akan Hadir', 'Mungkin Hadir', 'Berhalangan Hadir'];

const BANK_ACCOUNTS = [
  { bank: 'Bank BCA', number: '123456789', holder: 'Fadil' },
  { bank: 'Bank Mandiri', number: '123456789', holder: 'Fadil' },
];

export default function CherryTemplate() {
  const [isOpened, setIsOpened] = useState(false);
  const countdown = useCountdown(EVENT_DATE);

  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState<Attendance>('Akan Hadir');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = isOpened ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpened]);

  const eventDateLabel = useMemo(
    () => EVENT_DATE.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
    []
  );

  const submitRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setName('');
    setMessage('');
    setAttendance('Akan Hadir');
  };

  const copyAccount = (number: string, bank: string) => {
    navigator.clipboard?.writeText(number).catch(() => {});
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: PINK }}>
      {/* Back to site link */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-[60] flex items-center gap-1.5 bg-white/80 hover:bg-white text-[#3D1F1F] backdrop-blur-sm text-[10px] tracking-widest uppercase font-semibold px-3 py-2 rounded-full shadow-sm transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        nicemice
      </Link>

      {/* ============ COVER ============ */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 overflow-y-auto px-6 py-10 transition-all duration-700 ease-in-out ${
          isOpened ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
        style={{ backgroundColor: PINK }}
      >
        {/* Cropped to just the wavy card (see COVER_CARD_CROP above) so it floats directly
            on the page's own pink instead of the PNG's slightly-off pink export background. */}
        <div
          className="relative w-full max-w-[320px] mx-auto overflow-hidden shadow-sm"
          style={{ aspectRatio: `${COVER_CARD_W} / ${COVER_CARD_H}` }}
        >
          <img src={coverImg} alt="Rose & Jack said I do! - 30 Juni 2027" style={COVER_CARD_IMG_STYLE} />
        </div>

        <div className="text-center">
          <p className="text-sm" style={{ color: TERRACOTTA, fontFamily: "'Lora', serif" }}>
            Kepada Yth.
          </p>
          <p className="mt-1 text-lg font-bold" style={{ color: '#3D1F1F', fontFamily: "'Courier Prime', monospace" }}>
            Abigail M
          </p>
        </div>

        <button
          onClick={() => setIsOpened(true)}
          className="flex items-center gap-2 text-white text-sm font-bold px-8 py-3.5 rounded-sm shadow-md transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: TERRACOTTA, fontFamily: "'Courier Prime', monospace" }}
        >
          buka undangan
        </button>
      </div>

      {/* ============ FULL INVITATION ============ */}
      <div className="max-w-[480px] mx-auto" style={{ backgroundColor: PINK }}>
        <FullBleedImage src={section1Img} alt="Polaroid pasangan dan kutipan cinta" imageHeight={1800} />
        <FullBleedImage src={section2Img} alt="Pembukaan dan mempelai" imageHeight={2400} />
        <FullBleedImage src={section3Img} alt="Detail acara pernikahan" imageHeight={2800} />

        {/* Countdown - React (live) */}
        <section style={{ backgroundColor: CREAM }} className="px-6 py-12 text-center">
          <div
            className="flex items-center justify-center gap-1 sm:gap-2 font-bold"
            style={{ color: TERRACOTTA, fontFamily: "'Courier Prime', monospace" }}
          >
            {[
              { label: 'DAYS', value: countdown.days },
              { label: 'HOURS', value: countdown.hours },
              { label: 'MINS', value: countdown.minutes },
              { label: 'SECS', value: countdown.seconds },
            ].map((unit, idx) => (
              <div key={unit.label} className="flex items-center gap-1 sm:gap-2">
                {idx > 0 && <span className="text-2xl sm:text-4xl opacity-60">:</span>}
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-5xl leading-none">{String(unit.value).padStart(2, '0')}</span>
                  <span
                    className="mt-2 text-[10px] tracking-[0.2em] uppercase font-medium"
                    style={{ color: '#3D2B1F', fontFamily: "'Lora', serif" }}
                  >
                    {unit.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm italic" style={{ color: TERRACOTTA, fontFamily: "'Lora', serif" }}>
            Menghitung hari menuju momen bahagia kami
          </p>
        </section>

        {/* Lokasi - React */}
        <section style={{ backgroundColor: CREAM }} className="px-6 py-12 text-center space-y-4">
          <h2
            className="text-2xl"
            style={{ color: TERRACOTTA, fontFamily: "'Courier Prime', monospace" }}
          >
            Lokasi Acara
          </h2>
          <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: '#3D2B1F', fontFamily: "'Lora', serif" }}>
            <MapPin className="w-4 h-4 inline -mt-1 mr-1" style={{ color: TERRACOTTA }} />
            Gedung Serbaguna ABC, Jl. Cempaka No. 18, Kota Bogor, Jawa Barat
          </p>
          <p className="text-xs tracking-widest uppercase opacity-60" style={{ color: '#3D2B1F' }}>
            {eventDateLabel}
          </p>
          <div className="rounded-xl overflow-hidden shadow-sm border" style={{ borderColor: `${TERRACOTTA}33` }}>
            <iframe
              title="Lokasi acara pernikahan"
              src={`https://maps.google.com/maps?q=${MAPS_QUERY}&z=15&output=embed`}
              className="w-full h-52 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs tracking-widest uppercase font-semibold px-6 py-3 rounded-full text-white transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: TERRACOTTA }}
          >
            Buka di Google Maps
          </a>
        </section>

        <FullBleedImage src={section5Img} alt="Dress code, cerita kami, dan linimasa" imageHeight={2723} />

        {/* RSVP Form - React */}
        <section style={{ backgroundColor: CREAM }} className="px-6 py-12">
          <form onSubmit={submitRsvp} className="space-y-4 max-w-sm mx-auto">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#3D2B1F' }}>
                Nama
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full bg-white border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1"
                style={{ borderColor: `${TERRACOTTA}55` }}
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold tracking-wide uppercase block" style={{ color: '#3D2B1F' }}>
                Konfirmasi Kehadiran
              </span>
              <div className="space-y-2">
                {ATTENDANCE_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-3 border rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-colors"
                    style={{
                      borderColor: attendance === opt ? TERRACOTTA : `${TERRACOTTA}33`,
                      backgroundColor: attendance === opt ? `${TERRACOTTA}14` : 'white',
                      color: '#3D2B1F',
                    }}
                  >
                    <input
                      type="radio"
                      name="attendance"
                      value={opt}
                      checked={attendance === opt}
                      onChange={() => setAttendance(opt)}
                      className="accent-current"
                      style={{ accentColor: TERRACOTTA }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#3D2B1F' }}>
                Pesan/ucapan
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Tulis doa & ucapan Anda..."
                className="w-full bg-white border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 resize-none"
                style={{ borderColor: `${TERRACOTTA}55` }}
              />
            </div>

            <button
              type="submit"
              className="w-full text-white text-xs tracking-[0.2em] uppercase font-semibold py-3.5 rounded-full transition-transform hover:scale-[1.02] active:scale-95"
              style={{ backgroundColor: TERRACOTTA }}
            >
              {submitted ? 'Terkirim!' : 'Kirim Ucapan'}
            </button>
          </form>
        </section>

        {/* Tanda Kasih - React */}
        <section style={{ backgroundColor: CREAM }} className="px-6 py-12 text-center space-y-4">
          <h2
            className="text-2xl"
            style={{ color: TERRACOTTA, fontFamily: "'Courier Prime', monospace" }}
          >
            Tanda Kasih
          </h2>
          <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: '#3D2B1F', fontFamily: "'Lora', serif" }}>
            Doa restu Anda adalah karunia yang berarti bagi kami. Jika ingin memberi tanda kasih, kami dengan senang
            hati menerimanya melalui:
          </p>
          <div className="space-y-3 max-w-sm mx-auto text-left">
            {BANK_ACCOUNTS.map((acc) => (
              <div
                key={acc.bank}
                className="flex items-center justify-between bg-white border rounded-xl px-4 py-3"
                style={{ borderColor: `${TERRACOTTA}40` }}
              >
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#3D2B1F' }}>
                    {acc.bank}
                  </p>
                  <p className="text-sm tracking-wider" style={{ color: TERRACOTTA }}>
                    {acc.number}
                  </p>
                  <p className="text-[10px] opacity-60 uppercase tracking-widest" style={{ color: '#3D2B1F' }}>
                    a.n {acc.holder}
                  </p>
                </div>
                <button
                  onClick={() => copyAccount(acc.number, acc.bank)}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold border rounded-full px-3 py-2 transition-colors hover:opacity-80"
                  style={{ borderColor: `${TERRACOTTA}66`, color: TERRACOTTA }}
                >
                  {copiedBank === acc.bank ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedBank === acc.bank ? 'Tersalin' : 'Salin'}
                </button>
              </div>
            ))}
          </div>
        </section>

        <FullBleedImage src={section7Img} alt="Penutup dan ucapan terima kasih" imageHeight={2399} />
      </div>
    </div>
  );
}
