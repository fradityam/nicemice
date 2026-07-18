import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  Clock,
  Copy,
  Heart,
  MapPin,
} from 'lucide-react';

const EVENT_DATE = new Date('2027-08-01T08:00:00+07:00');
const LOCATION_NAME = 'Gedung Serbaguna ABC';
const LOCATION_ADDRESS = 'Jl. Cempaka No. 18, Kota Bogor';
const MAPS_QUERY = encodeURIComponent(`${LOCATION_NAME}, ${LOCATION_ADDRESS}`);

const typewriter = { fontFamily: "'Courier Prime', monospace" };

/** Builds a smooth wavy blob outline (Catmull-Rom -> cubic bezier) for the cover card frame. */
function makeWavyBlobPath(width: number, height: number, bumps: number, amplitude: number) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;
  const steps = bumps * 6;
  const points: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const wave = 1 + amplitude * Math.sin(t * bumps);
    points.push([cx + rx * wave * Math.cos(t), cy + ry * wave * Math.sin(t)]);
  }
  const n = points.length;
  const at = (i: number) => points[(i + n) % n];
  let d = `M ${at(0)[0].toFixed(2)} ${at(0)[1].toFixed(2)} `;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} `;
  }
  return d + 'Z';
}

const WAVY_CARD_PATH = makeWavyBlobPath(400, 520, 9, 0.035);

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

/** Hand-drawn illustrated car with a bow on the roof, in the palette's blue accent. */
function CarWithBow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 150" className={className} fill="none">
      <ellipse cx="120" cy="122" rx="95" ry="8" fill="#3D1F1F" opacity="0.08" />
      <circle cx="62" cy="107" r="17" fill="#3D1F1F" />
      <circle cx="62" cy="107" r="6.5" fill="#FDE8E8" />
      <circle cx="178" cy="107" r="17" fill="#3D1F1F" />
      <circle cx="178" cy="107" r="6.5" fill="#FDE8E8" />
      <path
        d="M18 103 L18 72 Q18 56 38 56 L68 56 Q84 28 112 28 L148 28 Q170 28 180 56 L206 56 Q224 56 224 78 L224 103 Z"
        fill="#4B5FDB"
        stroke="#3D1F1F"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M83 55 Q94 36 111 36 L111 55 Z" fill="#FDF3F0" stroke="#3D1F1F" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M119 36 L147 36 Q160 37 168 55 L119 55 Z" fill="#FDF3F0" stroke="#3D1F1F" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="115" y1="56" x2="115" y2="103" stroke="#3D1F1F" strokeWidth="2.5" />
      <rect x="30" y="86" width="14" height="8" rx="2" fill="#3D1F1F" opacity="0.5" />
      <g transform="translate(112,22)">
        <path d="M0,4 L-22,-12 L-15,4 Z" fill="#C1440E" stroke="#3D1F1F" strokeWidth="2" strokeLinejoin="round" />
        <path d="M0,4 L22,-12 L15,4 Z" fill="#C1440E" stroke="#3D1F1F" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="0" cy="2" r="7" fill="#C1440E" stroke="#3D1F1F" strokeWidth="2" />
      </g>
    </svg>
  );
}

function BowRibbon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 60" className={className} fill="none">
      <path d="M50,30 C50,30 20,4 6,16 C-4,24 10,44 50,30" fill="#C1440E" stroke="#3D1F1F" strokeWidth="2" strokeLinejoin="round" />
      <path d="M50,30 C50,30 80,4 94,16 C104,24 90,44 50,30" fill="#C1440E" stroke="#3D1F1F" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="50" cy="30" r="9" fill="#C1440E" stroke="#3D1F1F" strokeWidth="2" />
    </svg>
  );
}

function PlaceholderPhoto({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#FDE8E8] via-[#FBD5D5] to-[#F6C6C6] text-[#C1440E] ${className}`}
    >
      <Camera className="w-6 h-6 opacity-60" />
      <span className="text-[9px] tracking-[0.2em] uppercase opacity-60" style={typewriter}>
        {label}
      </span>
    </div>
  );
}

interface Wish {
  id: number;
  name: string;
  attendance: 'Hadir' | 'Tidak Hadir' | 'Ragu-ragu';
  message: string;
}

const SEED_WISHES: Wish[] = [
  { id: 1, name: 'Nadia & Farrel', attendance: 'Hadir', message: 'Selamat menempuh hidup baru Rose & Jack! Semoga selalu bahagia ya 💕' },
  { id: 2, name: 'Bayu Saputra', attendance: 'Hadir', message: 'Kalian pasangan paling serasi. Ditunggu resepsinya!' },
];

const LOVE_STORY = [
  { year: '2019', title: 'Pertama Bertemu', text: 'Rose & Jack bertemu tanpa sengaja di sebuah acara komunitas dan mengobrol sampai lupa waktu.' },
  { year: '2021', title: 'Mulai Dekat', text: 'Dari teman ngobrol jadi teman perjalanan — banyak road trip kecil yang mempererat mereka berdua.' },
  { year: '2024', title: 'Melamar', text: 'Jack melamar Rose di tempat pertama mereka mengobrol, lengkap dengan mobil kesayangan berpita.' },
  { year: '2027', title: 'Menikah', text: 'Dan kini, saatnya Rose & Jack memulai babak baru sebagai suami istri.' },
];

const GALLERY_LABELS = ['Momen 1', 'Momen 2', 'Momen 3', 'Momen 4', 'Momen 5', 'Momen 6'];

const BANK_ACCOUNTS = [
  { bank: 'Bank BCA', number: '123456789', holder: 'Rose Malina' },
  { bank: 'Bank Mandiri', number: '123456789', holder: 'Rose Malina' },
];

export default function CherryTemplate() {
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get('to') || 'Abigail M';

  const [isOpened, setIsOpened] = useState(false);
  const countdown = useCountdown(EVENT_DATE);

  const [wishes, setWishes] = useState<Wish[]>(SEED_WISHES);
  const [wishForm, setWishForm] = useState<{ name: string; attendance: Wish['attendance']; message: string }>({
    name: '',
    attendance: 'Hadir',
    message: '',
  });
  const [wishSubmitted, setWishSubmitted] = useState(false);
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

  const submitWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishForm.name.trim() || !wishForm.message.trim()) return;
    setWishes((prev) => [{ id: Date.now(), ...wishForm }, ...prev]);
    setWishForm({ name: '', attendance: 'Hadir', message: '' });
    setWishSubmitted(true);
    setTimeout(() => setWishSubmitted(false), 3000);
  };

  const copyAccount = (number: string, bank: string) => {
    navigator.clipboard?.writeText(number).catch(() => {});
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDE8E8] text-[#3D1F1F]" style={{ fontFamily: "'Lora', serif" }}>
      {/* Back to site link */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-[60] flex items-center gap-1.5 bg-white/70 hover:bg-white text-[#3D1F1F] backdrop-blur-sm text-[10px] tracking-widest uppercase font-semibold px-3 py-2 rounded-full shadow-sm transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        nicemice
      </Link>

      {/* ============ COVER ============ */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-[#FDE8E8] transition-all duration-700 ease-in-out ${
          isOpened ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase opacity-50" style={typewriter}>
          Save The Date
        </div>

        {/* Wavy cream card */}
        <div className="relative w-full max-w-[320px] aspect-[400/520]">
          <svg viewBox="0 0 400 520" preserveAspectRatio="none" className="absolute inset-0 w-full h-full drop-shadow-lg">
            <path d={WAVY_CARD_PATH} fill="#FFF8F0" stroke="#C1440E" strokeWidth="2.5" />
          </svg>
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8 py-10 gap-4">
            <CarWithBow className="w-32 h-auto" />
            <h1 className="text-2xl leading-snug" style={typewriter}>
              Rose &amp; Jack
              <br />
              said &quot;I do!&quot;
            </h1>
            <div className="w-10 h-px bg-[#C1440E]/50" />
            <p className="text-sm tracking-[0.15em] uppercase" style={typewriter}>
              30 Juni 2027
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs tracking-[0.2em] uppercase opacity-60 mb-1">Kepada Yth.</p>
          <p className="text-lg font-semibold" style={typewriter}>
            {guestName}
          </p>
        </div>

        <button
          onClick={() => setIsOpened(true)}
          className="mt-8 bg-[#C1440E] hover:bg-[#a3390c] text-white text-xs tracking-[0.2em] uppercase font-semibold px-8 py-4 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Heart className="w-3.5 h-3.5 fill-white" />
          Buka Undangan
        </button>
      </div>

      {/* ============ FULL INVITATION ============ */}
      <div className="max-w-lg mx-auto px-5 sm:px-8 pt-24 pb-16 space-y-20">
        {/* Polaroid photos */}
        <section className="flex justify-center gap-4 flex-wrap pt-4">
          {[
            { rotate: '-rotate-6', label: 'Rose & Jack' },
            { rotate: 'rotate-3', label: 'Our Story' },
            { rotate: '-rotate-2', label: 'Forever' },
          ].map((p) => (
            <div key={p.label} className={`bg-white p-3 pb-6 shadow-md ${p.rotate} transition-transform hover:rotate-0`}>
              <PlaceholderPhoto label={p.label} className="w-24 h-28 sm:w-28 sm:h-32" />
              <p className="text-center text-[10px] mt-2 tracking-widest" style={typewriter}>
                {p.label}
              </p>
            </div>
          ))}
        </section>

        {/* Love quote */}
        <section className="text-center space-y-4">
          <BowRibbon className="w-16 h-auto mx-auto" />
          <p className="italic text-base leading-relaxed max-w-sm mx-auto">
            &quot;Cinta itu bukan mencari yang sempurna, tapi menikmati perjalanan bersama orang yang tepat.&quot;
          </p>
        </section>

        {/* Bismillah opening */}
        <section className="text-center space-y-3">
          <p className="text-lg" style={typewriter}>
            Bismillahirrahmanirrahim
          </p>
          <p className="text-xs tracking-widest uppercase opacity-60">
            Assalamu&apos;alaikum Warahmatullahi Wabarakatuh
          </p>
          <p className="text-sm leading-relaxed max-w-sm mx-auto opacity-80">
            Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan kami dan
            mengharap kehadiran Bapak/Ibu/Saudara/i pada hari bahagia kami.
          </p>
        </section>

        {/* Bride & Groom */}
        <section className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          <div className="text-center space-y-3">
            <PlaceholderPhoto label="Rose" className="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-md" />
            <h3 className="text-xl" style={typewriter}>
              Rose Malina
            </h3>
            <p className="text-xs opacity-70 leading-relaxed">
              Putri dari
              <br />
              Bpk. Robert Malina &amp; Ibu Diana Malina
            </p>
          </div>

          <div className="hidden sm:flex justify-center">
            <Heart className="w-6 h-6 text-[#C1440E] fill-[#C1440E]/20" />
          </div>

          <div className="text-center space-y-3">
            <PlaceholderPhoto label="Jack" className="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-md" />
            <h3 className="text-xl" style={typewriter}>
              Jack Paro
            </h3>
            <p className="text-xs opacity-70 leading-relaxed">
              Putra dari
              <br />
              Bpk. Anton Paro &amp; Ibu Ella Paro
            </p>
          </div>
        </section>

        {/* Event details */}
        <section className="space-y-6">
          <h2 className="text-center text-2xl" style={typewriter}>
            Acara Pernikahan
          </h2>
          <p className="text-center text-xs tracking-widest uppercase opacity-60">{eventDateLabel}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/70 border border-[#C1440E]/20 rounded-2xl p-5 text-center space-y-2">
              <Calendar className="w-5 h-5 mx-auto text-[#C1440E]" />
              <h4 className="font-semibold text-sm">Akad Nikah</h4>
              <p className="text-xs opacity-70 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> 08.00 WIB
              </p>
            </div>
            <div className="bg-white/70 border border-[#C1440E]/20 rounded-2xl p-5 text-center space-y-2">
              <Calendar className="w-5 h-5 mx-auto text-[#C1440E]" />
              <h4 className="font-semibold text-sm">Resepsi</h4>
              <p className="text-xs opacity-70 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> 11.00 WIB
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 pt-2">
            {[
              { label: 'Hari', value: countdown.days },
              { label: 'Jam', value: countdown.hours },
              { label: 'Menit', value: countdown.minutes },
              { label: 'Detik', value: countdown.seconds },
            ].map((unit) => (
              <div key={unit.label} className="bg-[#C1440E] text-white rounded-xl py-3 text-center">
                <div className="text-xl sm:text-2xl font-bold" style={typewriter}>
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="text-[9px] tracking-[0.15em] uppercase opacity-80 mt-1">{unit.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Location */}
        <section className="space-y-4">
          <h2 className="text-center text-2xl" style={typewriter}>
            Lokasi Acara
          </h2>
          <div className="text-center space-y-1">
            <p className="font-semibold text-sm flex items-center justify-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C1440E]" /> {LOCATION_NAME}
            </p>
            <p className="text-xs opacity-70">{LOCATION_ADDRESS}</p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-[#C1440E]/20 shadow-sm">
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
            className="block text-center bg-[#C1440E] hover:bg-[#a3390c] text-white text-xs tracking-widest uppercase font-semibold py-3 rounded-full transition-colors"
          >
            Buka di Google Maps
          </a>
        </section>

        {/* Dress code */}
        <section className="text-center space-y-3">
          <h2 className="text-2xl" style={typewriter}>
            Dress Code
          </h2>
          <p className="text-lg tracking-[0.2em] uppercase" style={typewriter}>
            Batik
          </p>
          <div className="flex justify-center gap-3">
            {['#FDE8E8', '#C1440E', '#4B5FDB', '#3D1F1F'].map((c) => (
              <span key={c} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
        </section>

        {/* Cerita Kami */}
        <section className="space-y-6">
          <div className="text-center">
            <Heart className="w-7 h-7 mx-auto text-[#C1440E] fill-[#C1440E]/20 mb-2" />
            <h2 className="text-2xl" style={typewriter}>
              Cerita Kami
            </h2>
          </div>
          <div className="relative pl-6 space-y-8 border-l-2 border-dashed border-[#C1440E]/30">
            {LOVE_STORY.map((item) => (
              <div key={item.title} className="relative">
                <span className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full bg-[#C1440E] border-2 border-[#FFF8F0]" />
                <p className="text-[10px] tracking-widest uppercase opacity-60" style={typewriter}>
                  {item.year}
                </p>
                <h4 className="font-semibold text-sm mt-0.5">{item.title}</h4>
                <p className="text-xs opacity-70 leading-relaxed mt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Gallery */}
        <section className="space-y-4">
          <h2 className="text-center text-2xl" style={typewriter}>
            Galeri Foto
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {GALLERY_LABELS.map((label) => (
              <PlaceholderPhoto key={label} label={label} className="aspect-square rounded-lg" />
            ))}
          </div>
        </section>

        {/* Doa & Ucapan */}
        <section className="space-y-5">
          <h2 className="text-center text-2xl" style={typewriter}>
            Doa &amp; Ucapan
          </h2>

          <form onSubmit={submitWish} className="bg-white/70 border border-[#C1440E]/20 rounded-2xl p-5 space-y-3">
            <input
              type="text"
              required
              value={wishForm.name}
              onChange={(e) => setWishForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nama Anda"
              className="w-full bg-white border border-[#C1440E]/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#C1440E]"
            />
            <select
              value={wishForm.attendance}
              onChange={(e) => setWishForm((f) => ({ ...f, attendance: e.target.value as Wish['attendance'] }))}
              className="w-full bg-white border border-[#C1440E]/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#C1440E]"
            >
              <option value="Hadir">Hadir</option>
              <option value="Tidak Hadir">Tidak Hadir</option>
              <option value="Ragu-ragu">Ragu-ragu</option>
            </select>
            <textarea
              required
              value={wishForm.message}
              onChange={(e) => setWishForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Tulis doa & ucapan Anda..."
              rows={3}
              className="w-full bg-white border border-[#C1440E]/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#C1440E] resize-none"
            />
            <button
              type="submit"
              className="w-full bg-[#C1440E] hover:bg-[#a3390c] text-white text-xs tracking-widest uppercase font-semibold py-3 rounded-full transition-colors"
            >
              {wishSubmitted ? 'Terkirim!' : 'Kirim Ucapan'}
            </button>
          </form>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {wishes.map((w) => (
              <div key={w.id} className="bg-white/60 rounded-xl p-4 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{w.name}</span>
                  <span className="text-[9px] tracking-widest uppercase text-[#C1440E] bg-[#C1440E]/10 px-2 py-0.5 rounded-full">
                    {w.attendance}
                  </span>
                </div>
                <p className="text-xs opacity-70 leading-relaxed">{w.message}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tanda Kasih */}
        <section className="space-y-4">
          <h2 className="text-center text-2xl" style={typewriter}>
            Tanda Kasih
          </h2>
          <p className="text-center text-xs opacity-70 max-w-sm mx-auto leading-relaxed">
            Doa restu Anda adalah karunia yang berarti bagi kami. Jika ingin memberi tanda kasih, kami dengan
            senang hati menerimanya melalui:
          </p>
          <div className="space-y-3">
            {BANK_ACCOUNTS.map((acc) => (
              <div
                key={acc.bank}
                className="flex items-center justify-between bg-white/70 border border-[#C1440E]/20 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-sm">{acc.bank}</p>
                  <p className="text-xs opacity-70 tracking-wider">{acc.number}</p>
                  <p className="text-[10px] opacity-50 uppercase tracking-widest">a.n {acc.holder}</p>
                </div>
                <button
                  onClick={() => copyAccount(acc.number, acc.bank)}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold text-[#C1440E] border border-[#C1440E]/30 px-3 py-2 rounded-full hover:bg-[#C1440E]/10 transition-colors"
                >
                  {copiedBank === acc.bank ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedBank === acc.bank ? 'Tersalin' : 'Salin'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Closing */}
        <section className="text-center space-y-4 pt-6">
          <CarWithBow className="w-24 h-auto mx-auto" />
          <p className="text-sm opacity-70 max-w-xs mx-auto leading-relaxed">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan
            memberikan doa restu.
          </p>
          <h3 className="text-2xl" style={typewriter}>
            Rose &amp; Jack
          </h3>
          <div className="pt-8 text-[10px] tracking-widest uppercase opacity-40">
            Dibuat dengan{' '}
            <Heart className="w-2.5 h-2.5 inline fill-current text-[#C1440E] opacity-100" /> oleh{' '}
            <Link to="/" className="underline hover:opacity-70">
              nicemice
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
