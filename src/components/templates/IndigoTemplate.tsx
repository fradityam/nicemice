import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  MapPin,
  Menu,
} from 'lucide-react';

import heroImg1 from '../../assets/images/Indigo/WhatsApp Image 2026-08-16 at 12.29.23 PM-l.jpeg';
import heroImg2 from '../../assets/images/Indigo/heroo-2.jpeg';
import heroImg4 from '../../assets/images/Indigo/heroo-4.jpeg';
import weddingTextImg from '../../assets/images/Indigo/wedding_text.png';
import coverImg from '../../assets/images/Indigo/indigo-cover.png';
import signatureImg from '../../assets/images/Indigo/signature-mockup.png';
import groomImg from '../../assets/images/Indigo/WhatsApp Image 2026-08-16 at 12.29.23 PM-k.jpeg';
import brideImg from '../../assets/images/Indigo/WhatsApp Image 2026-08-16 at 12.29.23 PM-j.jpeg';
import messageImg from '../../assets/images/Indigo/WhatsApp Image 2026-08-16 at 12.29.23 PM-m.jpeg';
import album1 from '../../assets/images/Indigo/WhatsApp Image 2026-08-16 at 12.29.22 PM.jpeg';
import album2 from '../../assets/images/Indigo/WhatsApp Image 2026-08-16 at 12.29.22 PM-b.jpeg';
import album3 from '../../assets/images/Indigo/WhatsApp Image 2026-08-16 at 12.29.22 PM-c.jpeg';
import album4 from '../../assets/images/Indigo/WhatsApp Image 2026-08-16 at 12.29.22 PM-d.jpeg';
import album5 from '../../assets/images/Indigo/WhatsApp Image 2026-08-16 at 12.29.22 PM-e.jpeg';
import album6 from '../../assets/images/Indigo/WhatsApp Image 2026-08-16 at 12.29.22 PM-f.jpeg';
import album7 from '../../assets/images/Indigo/WhatsApp Image 2026-08-16 at 12.29.23 PM-h.jpeg';
import album8 from '../../assets/images/Indigo/WhatsApp Image 2026-08-16 at 12.29.23 PM-i.jpeg';
import { FitToHeight, STAGE_BG } from './templateStage';

const NAVY = '#0D1B4B';
const CARD_NAVY = '#1A2A6C';
const ORANGE = '#FF5C00';

const heading = { fontFamily: "'Playfair Display', serif" };
const body = { fontFamily: "'Inter', sans-serif" };

const EVENT_DATE = new Date('2027-01-08T08:00:00+07:00');
const LOCATION_NAME = 'Gedung Serbaguna ABC';
const LOCATION_ADDRESS = 'Jl. Cempaka No. 18, Kota Bogor, Jawa Barat';
const MAPS_QUERY = encodeURIComponent(`${LOCATION_NAME}, ${LOCATION_ADDRESS}`);

const ALBUM_PHOTOS = [album1, album2, album3, album4, album5, album6, album7, album8];
// album4 (WhatsApp Image ...-d) crops the groom out on the left when center-cropped;
// shift the focal point left (but not all the way) so both faces stay in frame.
const ALBUM_PHOTO_POSITIONS: Record<number, string> = {
  3: '20% center',
};
const HERO_SLIDES = [heroImg1, heroImg2, heroImg4];
const HERO_SLIDE_INTERVAL_MS = 5000;

// indigo-cover.png (1122x1402) has a leftover "Page 1 / Page 2 / Page 3" design-tool page
// switcher baked into the top strip (a Figma/Canva export artifact, not real content) between
// y=35 and y=61. Cropping it out with a plain vertical trim: keep the full width, drop the
// top 70px (comfortably past the artifact, before the wavy card starts around y=94), and let
// the container's shorter aspect-ratio clip the equivalent amount off the bottom.
const COVER_IMG_W = 1122;
const COVER_IMG_H = 1402;
const COVER_CROP_TOP = 70;
const COVER_CROP_H = COVER_IMG_H - COVER_CROP_TOP;
const COVER_IMG_STYLE: React.CSSProperties = {
  position: 'absolute',
  width: '100%',
  left: 0,
  top: `${-(COVER_CROP_TOP / COVER_CROP_H) * 100}%`,
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

/** Solid orange tab with rotated text, used for event-card / venue labels. */
function VerticalTab({ text, variant = 'orange' }: { text: string; variant?: 'orange' | 'navy' }) {
  return (
    <div
      className="flex items-center justify-center text-xs font-bold tracking-[0.15em] uppercase px-2.5 py-3 flex-shrink-0 whitespace-nowrap"
      style={{
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
        backgroundColor: variant === 'navy' ? CARD_NAVY : ORANGE,
        color: variant === 'navy' ? ORANGE : '#FFFFFF',
        ...body,
      }}
    >
      {text}
    </div>
  );
}

type Attendance = 'Hadir' | 'Tidak Hadir' | 'Belum Tahu';
const ATTENDANCE_OPTIONS: Attendance[] = ['Hadir', 'Tidak Hadir', 'Belum Tahu'];

function AttendancePicker({
  value,
  onChange,
}: {
  value: Attendance | null;
  onChange: (v: Attendance) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {ATTENDANCE_OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`text-xs font-semibold py-2.5 rounded-lg border transition-colors ${
            value === opt
              ? 'bg-[#FF5C00] border-[#FF5C00] text-white'
              : 'bg-[#1A2A6C] border-[#FF5C00]/30 text-white/70 hover:border-[#FF5C00]/70'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

const BANK_ACCOUNTS = [
  { bank: 'Bank BCA', number: '123456789', holder: 'Fadil' },
  { bank: 'Bank Mandiri', number: '123456789', holder: 'Fadil' },
];

export default function IndigoTemplate() {
  const [isOpened, setIsOpened] = useState(false);
  useEffect(() => {
    document.body.style.overflow = isOpened ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpened]);

  const countdown = useCountdown(EVENT_DATE);

  const [heroSlide, setHeroSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setHeroSlide((i) => (i + 1) % HERO_SLIDES.length);
    }, HERO_SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const [albumIndex, setAlbumIndex] = useState(0);
  const touchStartX = useRef(0);

  const [akadAttendance, setAkadAttendance] = useState<Attendance | null>(null);
  const [resepsiAttendance, setResepsiAttendance] = useState<Attendance | null>(null);
  const [rsvpForm, setRsvpForm] = useState({ name: '', email: '', message: '' });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const partyDateLabel = useMemo(
    () => EVENT_DATE.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
    []
  );

  const nextAlbumPhoto = () => setAlbumIndex((i) => (i + 1) % ALBUM_PHOTOS.length);
  const prevAlbumPhoto = () => setAlbumIndex((i) => (i - 1 + ALBUM_PHOTOS.length) % ALBUM_PHOTOS.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) prevAlbumPhoto();
    else if (delta < -50) nextAlbumPhoto();
  };

  const submitRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpForm.name.trim() || !rsvpForm.email.trim()) return;
    setRsvpSubmitted(true);
    setTimeout(() => setRsvpSubmitted(false), 3000);
    setRsvpForm({ name: '', email: '', message: '' });
  };

  const copyAccount = (number: string, bank: string) => {
    navigator.clipboard?.writeText(number).catch(() => {});
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: STAGE_BG, ...body }}>
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
        className={`fixed inset-0 z-50 mx-auto max-w-[480px] flex flex-col items-center justify-center gap-6 overflow-y-auto px-6 py-10 transition-all duration-700 ease-in-out ${
          isOpened ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
        style={{ backgroundColor: NAVY }}
      >
        <FitToHeight className="flex flex-col items-center gap-6">
          <div
            className="relative w-full max-w-[380px] mx-auto overflow-hidden"
            style={{ aspectRatio: `${COVER_IMG_W} / ${COVER_CROP_H}` }}
          >
            <img src={coverImg} alt="Fadil & Ratu - 08.01.2027" style={COVER_IMG_STYLE} />
          </div>

          <div className="text-center">
            <p className="text-sm" style={{ color: ORANGE }}>
              Kepada Yth.
            </p>
            <p className="mt-1 text-lg font-bold text-white">Abigail M</p>
          </div>

          <button
            onClick={() => setIsOpened(true)}
            className="w-full max-w-[280px] text-white text-sm font-bold py-3.5 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: ORANGE }}
          >
            Buka Undangan
          </button>
        </FitToHeight>
      </div>

      {/* ============ FULL INVITATION ============ */}
      <div className="max-w-[480px] mx-auto text-white" style={{ backgroundColor: NAVY }}>
        {/* ============ HERO ============ */}
        <section className="relative h-screen min-h-[600px] overflow-hidden">
          {HERO_SLIDES.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt="Fadil & Ratu"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                idx === heroSlide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${NAVY}CC 0%, ${NAVY}33 30%, ${NAVY}33 60%, ${NAVY}F2 100%)`,
            }}
          />

          <Link
            to="/"
            aria-label="Kembali ke nicemice"
            className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <Menu className="w-5 h-5 text-white" />
          </Link>

          <div className="absolute top-6 inset-x-0 z-10 flex flex-col items-center px-5 pointer-events-none">
            <img src={weddingTextImg} alt="Wedding" className="w-full" />
            <div className="mt-3 flex flex-col items-center">
              <div className="h-px bg-white w-full" />
              <p
                className="py-1.5 text-center text-white uppercase tracking-[0.2em] whitespace-nowrap"
                style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: '16px' }}
              >
                Wedding Invitation
              </p>
              <div className="h-px bg-white w-full" />
            </div>
          </div>

          <div className="absolute bottom-6 left-5 z-10">
            <p className="text-2xl font-bold tracking-wide" style={heading}>
              08.01.2027
            </p>
          </div>

          <img
            src={signatureImg}
            alt="Fadil & Ratu signature"
            className="absolute z-10 pointer-events-none"
            style={{ bottom: '24px', right: '16px', width: '170px' }}
          />
        </section>

        {/* ============ COUNTDOWN ============ */}
        <section className="px-5 py-12">
          <div className="relative">
            {/* Stacked "paper" cards peeking out behind the main card */}
            <div
              className="absolute inset-0 translate-x-2 translate-y-2 border z-0"
              style={{ backgroundColor: NAVY, borderColor: ORANGE }}
            />
            <div
              className="absolute inset-0 translate-x-4 translate-y-4 border z-0"
              style={{ backgroundColor: NAVY, borderColor: ORANGE }}
            />

            {/* Main card */}
            <div className="relative z-10 border" style={{ backgroundColor: CARD_NAVY, borderColor: ORANGE }}>
              {/* Row 1: label */}
              <div className="px-5 py-3 border-b" style={{ borderColor: ORANGE }}>
                <p className="italic text-base" style={{ ...heading, color: ORANGE }}>
                  Countdown
                </p>
              </div>

              {/* Row 2: days */}
              <div className="px-5 py-4 border-b flex items-baseline gap-2" style={{ borderColor: ORANGE }}>
                <span className="text-6xl font-bold leading-none" style={{ ...heading, color: ORANGE }}>
                  {countdown.days}
                </span>
                <span className="text-lg" style={{ color: ORANGE }}>
                  days
                </span>
              </div>

              {/* Row 3: hours / minutes / seconds */}
              <div className="grid grid-cols-3 border-b" style={{ borderColor: ORANGE }}>
                {[
                  { label: 'hours', value: countdown.hours },
                  { label: 'minutes', value: countdown.minutes },
                  { label: 'seconds', value: countdown.seconds },
                ].map((unit, idx) => (
                  <div
                    key={unit.label}
                    className="text-center py-4"
                    style={idx !== 0 ? { borderLeft: `1px solid ${ORANGE}` } : undefined}
                  >
                    <div className="text-2xl font-bold" style={{ ...heading, color: ORANGE }}>
                      {String(unit.value).padStart(2, '0')}
                    </div>
                    <div className="text-xs mt-1" style={{ color: ORANGE }}>
                      {unit.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 4: target date */}
              <div className="px-5 py-3 text-center">
                <span className="text-sm" style={{ color: ORANGE }}>
                  to 08.01.2027
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ MESSAGE ============ */}
        <section className="px-5 py-12" style={{ backgroundColor: ORANGE }}>
          <h2 className="text-3xl font-bold italic text-center" style={heading}>
            Message
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-center text-white/95">
            Dengan penuh rasa syukur dan kebahagiaan, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan
            memberikan doa restu pada hari pernikahan kami.
          </p>
          <img
            src={messageImg}
            alt="Fadil & Ratu"
            className="mt-6 w-full aspect-[4/3] object-cover rounded-2xl border-2 border-white/30"
          />
        </section>

        {/* ============ PROFILE ============ */}
        <section className="px-5 py-12 space-y-10">
          <h2 className="text-3xl font-bold italic text-center" style={{ ...heading, color: ORANGE }}>
            Profile
          </h2>

          <div className="text-center">
            <img src={groomImg} alt="Fadil" className="w-full aspect-[4/5] object-cover rounded-2xl" />
            <p className="mt-4 text-xs tracking-[0.3em] uppercase" style={{ color: ORANGE }}>
              groom
            </p>
            <h3 className="text-2xl font-bold italic mt-1" style={heading}>
              Fadil
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Putra dari Bpk. Soelistiyono &amp; Ibu Sekar Mayangsari
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3 max-w-xs mx-auto">
              Sangat menantikan untuk bertemu dengan kalian semua! Semoga hari ini menjadi kenangan indah
              bagi kita bersama.
            </p>
          </div>

          <div className="text-center">
            <img src={brideImg} alt="Ratu" className="w-full aspect-[4/5] object-cover rounded-2xl" />
            <p className="mt-4 text-xs tracking-[0.3em] uppercase" style={{ color: ORANGE }}>
              bride
            </p>
            <h3 className="text-2xl font-bold italic mt-1" style={heading}>
              Ratu
            </h3>
            <p className="text-xs text-white/60 mt-1">Putri dari Bpk. Kayo &amp; Ibu Dewi Sudiar</p>
            <p className="text-sm text-white/70 leading-relaxed mt-3 max-w-xs mx-auto">
              Terima kasih atas dukungan yang tak pernah putus. Kami menantikan kehadiran dan doa restu
              dari kalian semua.
            </p>
          </div>
        </section>

        {/* ============ ALBUM ============ */}
        <section className="px-5 py-12">
          <h2 className="text-3xl font-bold italic text-center mb-6" style={{ ...heading, color: ORANGE }}>
            Album
          </h2>

          <div
            className="relative rounded-2xl overflow-hidden aspect-[4/5]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={ALBUM_PHOTOS[albumIndex]}
              alt={`Momen ${albumIndex + 1}`}
              className="w-full h-full object-cover select-none"
              style={{ objectPosition: ALBUM_PHOTO_POSITIONS[albumIndex] ?? 'center' }}
              draggable={false}
            />
            <button
              onClick={prevAlbumPhoto}
              aria-label="Foto sebelumnya"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={nextAlbumPhoto}
              aria-label="Foto berikutnya"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {ALBUM_PHOTOS.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setAlbumIndex(idx)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                  idx === albumIndex ? 'border-[#FF5C00]' : 'border-transparent opacity-60'
                }`}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: ALBUM_PHOTO_POSITIONS[idx] ?? 'center' }}
                />
              </button>
            ))}
          </div>
        </section>

        {/* ============ PARTY INFORMATION ============ */}
        <section className="px-5 py-12 space-y-6">
          <h2 className="text-3xl font-bold italic text-center" style={{ ...heading, color: ORANGE }}>
            Party Information
          </h2>

          <div className="text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: ORANGE }}>
              Date
            </p>
            <p className="text-lg font-semibold mt-1 capitalize">{partyDateLabel}</p>
          </div>

          <div className="rounded-2xl overflow-hidden flex border" style={{ backgroundColor: CARD_NAVY, borderColor: `${ORANGE}40` }}>
            <VerticalTab text="Akad Nikah" />
            <div className="flex-1 flex flex-col justify-center py-4 px-5 space-y-1">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" style={{ color: ORANGE }} /> Start 08.00 &ndash; selesai
              </p>
              <p className="text-xs text-white/60 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: ORANGE }} />
                Masjid Al-Abror, Jl. Kenanga No. 17
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden flex border" style={{ backgroundColor: CARD_NAVY, borderColor: `${ORANGE}40` }}>
            <VerticalTab text="Resepsi" />
            <div className="flex-1 flex flex-col justify-center py-4 px-5 space-y-1">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" style={{ color: ORANGE }} /> Start 11.00 &ndash; 14.00
              </p>
              <p className="text-[11px] italic text-white/50">Lokasi: lihat Venue di bawah</p>
            </div>
          </div>

          {/* ============ VENUE ============ */}
          <div className="rounded-2xl overflow-hidden flex" style={{ backgroundColor: ORANGE }}>
            <VerticalTab text="Venue" variant="navy" />
            <div className="flex-1 flex flex-col justify-center py-4 px-5 space-y-1">
              <p className="text-sm font-semibold" style={{ color: NAVY }}>{LOCATION_NAME}</p>
              <p className="text-xs" style={{ color: NAVY, opacity: 0.75 }}>{LOCATION_ADDRESS}</p>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border" style={{ borderColor: `${ORANGE}40` }}>
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
            className="block text-center text-white text-xs tracking-widest uppercase font-semibold py-3 rounded-full transition-transform hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: ORANGE }}
          >
            Buka di Google Maps
          </a>
        </section>

        {/* ============ RSVP ============ */}
        <section className="px-5 py-12 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold italic" style={{ ...heading, color: ORANGE }}>
              RSVP
            </h2>
            <p className="text-sm text-white/60 mt-1">Konfirmasi Kehadiranmu</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide uppercase text-white/70">Akad Nikah</p>
            <AttendancePicker value={akadAttendance} onChange={setAkadAttendance} />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide uppercase text-white/70">Resepsi</p>
            <AttendancePicker value={resepsiAttendance} onChange={setResepsiAttendance} />
          </div>

          <form onSubmit={submitRsvp} className="space-y-3 pt-2">
            <input
              type="text"
              required
              value={rsvpForm.name}
              onChange={(e) => setRsvpForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nama lengkap"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/40 border focus:outline-none focus:ring-1 focus:ring-[#FF5C00]"
              style={{ backgroundColor: CARD_NAVY, borderColor: `${ORANGE}40` }}
            />
            <input
              type="email"
              required
              value={rsvpForm.email}
              onChange={(e) => setRsvpForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Email"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/40 border focus:outline-none focus:ring-1 focus:ring-[#FF5C00]"
              style={{ backgroundColor: CARD_NAVY, borderColor: `${ORANGE}40` }}
            />
            <textarea
              value={rsvpForm.message}
              onChange={(e) => setRsvpForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Pesan (opsional)"
              rows={3}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/40 border focus:outline-none focus:ring-1 focus:ring-[#FF5C00] resize-none"
              style={{ backgroundColor: CARD_NAVY, borderColor: `${ORANGE}40` }}
            />
            <button
              type="submit"
              className="w-full text-white text-xs tracking-[0.2em] uppercase font-semibold py-3.5 rounded-full transition-transform hover:scale-[1.02] active:scale-95"
              style={{ backgroundColor: ORANGE }}
            >
              {rsvpSubmitted ? 'Terkirim!' : 'Kirim RSVP'}
            </button>
          </form>
        </section>

        {/* ============ TANDA KASIH ============ */}
        <section className="px-5 py-12 space-y-4">
          <h2 className="text-3xl font-bold italic text-center" style={{ ...heading, color: ORANGE }}>
            Tanda Kasih
          </h2>
          <p className="text-sm text-white/60 text-center leading-relaxed max-w-xs mx-auto">
            Doa restu Anda adalah karunia yang berarti bagi kami. Jika ingin memberi tanda kasih, kami
            dengan senang hati menerimanya melalui:
          </p>

          <div className="space-y-3">
            {BANK_ACCOUNTS.map((acc) => (
              <div
                key={acc.bank}
                className="flex items-center justify-between rounded-xl px-4 py-3 border-2 border-dashed"
                style={{ backgroundColor: CARD_NAVY, borderColor: `${ORANGE}70` }}
              >
                <div>
                  <p className="font-semibold text-sm">{acc.bank}</p>
                  <p className="text-sm tracking-wider" style={{ color: ORANGE }}>
                    {acc.number}
                  </p>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest">a.n {acc.holder}</p>
                </div>
                <button
                  onClick={() => copyAccount(acc.number, acc.bank)}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold border rounded-full px-3 py-2 transition-colors hover:bg-[#FF5C00]/10"
                  style={{ borderColor: `${ORANGE}80`, color: ORANGE }}
                >
                  {copiedBank === acc.bank ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedBank === acc.bank ? 'Tersalin!' : 'Salin'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <section className="px-5 py-14 text-center border-t border-white/10">
          <p className="text-lg italic font-semibold" style={{ ...heading, color: ORANGE }}>
            Sampai Jumpa di Hari Bahagia Kami
          </p>
          <h3 className="text-2xl font-bold italic mt-3" style={heading}>
            Fadil &amp; Ratu
          </h3>
          <p className="text-xs tracking-[0.3em] text-white/50 mt-2">08.01.2027</p>
          <div className="mt-8 text-[10px] tracking-widest uppercase text-white/30">
            Dibuat oleh{' '}
            <Link to="/" className="underline hover:text-white/60">
              nicemice
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
