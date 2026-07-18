import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  Clock,
  Copy,
  MapPin,
} from 'lucide-react';

const EVENT_DATE = new Date('2026-10-10T08:00:00+07:00');
const LOCATION_NAME = 'Pendopo Agung Ndalem';
const LOCATION_ADDRESS = 'Jl. Malioboro No. 5, Yogyakarta';
const MAPS_QUERY = encodeURIComponent(`${LOCATION_NAME}, ${LOCATION_ADDRESS}`);

const display = { fontFamily: "'Playfair Display', serif" };

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

let kawungIdCounter = 0;

/** Tiled batik-kawung motif (four overlapping ellipse "petals" around a center dot). */
function KawungBackground({ className }: { className?: string }) {
  const [id] = useState(() => `kawung-${kawungIdCounter++}`);
  return (
    <svg className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#8B4513" strokeWidth="1.1" opacity="0.32">
            <ellipse cx="28" cy="16" rx="8" ry="14" />
            <ellipse cx="28" cy="40" rx="8" ry="14" />
            <ellipse cx="16" cy="28" rx="14" ry="8" />
            <ellipse cx="40" cy="28" rx="14" ry="8" />
            <circle cx="28" cy="28" r="3.5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Simple curling lung-lungan ornament used as a section divider. */
function BatikDivider({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 36" className={`mx-auto ${className}`} fill="none">
      <path d="M0 18 Q45 -4 75 18 Q90 28 108 18" stroke="#D4AF37" strokeWidth="1.4" />
      <path d="M220 18 Q175 -4 145 18 Q130 28 112 18" stroke="#D4AF37" strokeWidth="1.4" />
      <rect x="103" y="13" width="10" height="10" transform="rotate(45 108 18)" fill="#D4AF37" />
    </svg>
  );
}

function CornerFlourish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="none">
      <path d="M2 2 Q2 30 30 30" stroke="#D4AF37" strokeWidth="1.4" />
      <path d="M2 2 Q30 2 30 30" stroke="#D4AF37" strokeWidth="1.4" />
      <circle cx="2" cy="2" r="3" fill="#D4AF37" />
    </svg>
  );
}

function PlaceholderPhoto({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#F4E9D0] via-[#EAD8AE] to-[#D9BE84]/70 text-[#8B4513] border border-[#D4AF37]/40 ${className}`}
    >
      <Camera className="w-6 h-6 opacity-60" />
      <span className="text-[9px] tracking-[0.2em] uppercase opacity-60" style={display}>
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
  { id: 1, name: 'Bpk. Slamet & Keluarga', attendance: 'Hadir', message: 'Selamat menempuh hidup baru Ratu & Fadil, semoga sakinah mawaddah warahmah.' },
  { id: 2, name: 'Retno Ayu', attendance: 'Hadir', message: 'Bahagia sekali melihat kalian berdua bersanding. Barakallahu lakuma!' },
];

const LOVE_STORY = [
  { year: '2018', title: 'Pertama Bertemu', text: 'Ratu & Fadil bertemu di sebuah acara kebudayaan Jawa dan langsung akrab membahas gamelan.' },
  { year: '2021', title: 'Mulai Dekat', text: 'Perlahan kedekatan tumbuh lewat perhatian kecil dan kunjungan ke rumah keluarga.' },
  { year: '2025', title: 'Lamaran', text: 'Keluarga besar berkumpul dalam prosesi lamaran adat yang penuh kehangatan.' },
  { year: '2026', title: 'Menikah', text: 'Kini tiba saatnya Ratu & Fadil menyatukan dua keluarga dalam ikatan pernikahan.' },
];

const GALLERY_LABELS = ['Momen 1', 'Momen 2', 'Momen 3', 'Momen 4', 'Momen 5', 'Momen 6'];

const BANK_ACCOUNTS = [
  { bank: 'Bank BCA', number: '5566778899', holder: 'Ratu' },
  { bank: 'Bank Mandiri', number: '9988776655', holder: 'Ratu' },
];

export default function BatikTemplate() {
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get('to') || 'Leo Messi';

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
    <div className="min-h-screen bg-[#FDF6E3] text-[#3D2B1F]" style={{ fontFamily: "'Crimson Text', serif" }}>
      {/* Back to site link */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-[60] flex items-center gap-1.5 bg-white/80 hover:bg-white text-[#3D2B1F] backdrop-blur-sm text-[10px] tracking-widest uppercase font-semibold px-3 py-2 rounded-full shadow-sm transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        nicemice
      </Link>

      {/* ============ COVER ============ */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-[#FDF6E3] transition-all duration-700 ease-in-out overflow-hidden ${
          isOpened ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <KawungBackground className="absolute inset-0 w-full h-full" />

        <p className="absolute z-10 top-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase opacity-60">
          Save The Date
        </p>

        {/* Ornate double-border card */}
        <div className="relative z-10 w-full max-w-[320px] p-1.5 border border-[#D4AF37]">
          <div className="relative border border-[#8B4513]/60 bg-[#FFFDF7] px-8 py-12 text-center flex flex-col items-center gap-5">
            <CornerFlourish className="absolute top-2 left-2 w-8 h-8" />
            <CornerFlourish className="absolute bottom-2 right-2 w-8 h-8 rotate-180" />

            <h1 className="text-3xl italic leading-snug" style={display}>
              Ratu &amp; Fadil
            </h1>
            <BatikDivider className="w-32" />
            <p className="text-sm tracking-[0.2em] uppercase text-[#8B4513]">10 Oktober 2026</p>
          </div>
        </div>

        <div className="relative z-10 mt-8 text-center">
          <p className="text-xs tracking-[0.25em] uppercase opacity-60 mb-1">Kepada Yth.</p>
          <p className="text-lg font-semibold italic" style={display}>
            {guestName}
          </p>
        </div>

        <button
          onClick={() => setIsOpened(true)}
          className="relative z-10 mt-8 bg-[#8B4513] hover:bg-[#6e360f] text-[#FDF6E3] text-xs tracking-[0.2em] uppercase font-semibold px-8 py-4 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 border border-[#D4AF37]"
        >
          Buka Undangan
        </button>
      </div>

      {/* ============ FULL INVITATION ============ */}
      <div className="max-w-lg mx-auto px-5 sm:px-8 pt-24 pb-16 space-y-14">
        {/* Photos */}
        <section className="grid grid-cols-2 gap-3 pt-4">
          <PlaceholderPhoto label="Ratu & Fadil" className="aspect-[3/4] rounded-t-full" />
          <PlaceholderPhoto label="Bersama" className="aspect-[3/4] rounded-t-full mt-6" />
        </section>

        <BatikDivider className="w-48" />

        {/* Love quote */}
        <section className="text-center space-y-4">
          <p className="italic text-base leading-relaxed max-w-sm mx-auto" style={display}>
            &quot;Dan di antara tanda-tanda kekuasaan-Nya, diciptakan-Nya pasangan untukmu agar kamu merasa
            tenteram bersamanya.&quot;
          </p>
        </section>

        <BatikDivider className="w-48" />

        {/* Bismillah opening */}
        <section className="text-center space-y-3">
          <h2 className="text-lg" style={display}>
            Bismillahirrahmanirrahim
          </h2>
          <p className="text-[10px] tracking-widest uppercase opacity-60">
            Assalamu&apos;alaikum Warahmatullahi Wabarakatuh
          </p>
          <p className="text-sm leading-relaxed max-w-sm mx-auto opacity-80">
            Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan kami dan
            mengharap kehadiran Bapak/Ibu/Saudara/i pada hari bahagia kami.
          </p>
        </section>

        <BatikDivider className="w-48" />

        {/* Bride & Groom */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="text-center space-y-3">
            <PlaceholderPhoto label="Ratu" className="w-28 h-28 rounded-full mx-auto border-4 border-[#D4AF37]/50" />
            <h3 className="text-xl italic" style={display}>
              Ratu
            </h3>
            <p className="text-xs opacity-70 leading-relaxed">
              Putri dari
              <br />
              Bpk. Kayo &amp; Ibu Dewi Sudiar
            </p>
          </div>
          <div className="text-center space-y-3">
            <PlaceholderPhoto label="Fadil" className="w-28 h-28 rounded-full mx-auto border-4 border-[#D4AF37]/50" />
            <h3 className="text-xl italic" style={display}>
              Fadil
            </h3>
            <p className="text-xs opacity-70 leading-relaxed">
              Putra dari
              <br />
              Bpk. Soelistiyono &amp; Ibu Sekar Mayangsari
            </p>
          </div>
        </section>

        <BatikDivider className="w-48" />

        {/* Event details */}
        <section className="space-y-6">
          <h2 className="text-center text-2xl italic" style={display}>
            Acara Pernikahan
          </h2>
          <p className="text-center text-xs tracking-widest uppercase opacity-60">{eventDateLabel}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/70 border border-[#D4AF37]/40 rounded-lg p-5 text-center space-y-2">
              <Calendar className="w-5 h-5 mx-auto text-[#8B4513]" />
              <h4 className="font-semibold text-sm">Akad Nikah</h4>
              <p className="text-xs opacity-70 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> 08.00 WIB
              </p>
            </div>
            <div className="bg-white/70 border border-[#D4AF37]/40 rounded-lg p-5 text-center space-y-2">
              <Calendar className="w-5 h-5 mx-auto text-[#8B4513]" />
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
              <div key={unit.label} className="bg-[#8B4513] text-[#FDF6E3] rounded-lg py-3 text-center border border-[#D4AF37]/50">
                <div className="text-xl sm:text-2xl font-bold" style={display}>
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="text-[9px] tracking-[0.15em] uppercase opacity-80 mt-1">{unit.label}</div>
              </div>
            ))}
          </div>
        </section>

        <BatikDivider className="w-48" />

        {/* Location */}
        <section className="space-y-4">
          <h2 className="text-center text-2xl italic" style={display}>
            Lokasi Acara
          </h2>
          <div className="text-center space-y-1">
            <p className="font-semibold text-sm flex items-center justify-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#8B4513]" /> {LOCATION_NAME}
            </p>
            <p className="text-xs opacity-70">{LOCATION_ADDRESS}</p>
          </div>
          <div className="rounded-lg overflow-hidden border border-[#D4AF37]/40 shadow-sm">
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
            className="block text-center bg-[#8B4513] hover:bg-[#6e360f] text-[#FDF6E3] text-xs tracking-widest uppercase font-semibold py-3 rounded-full transition-colors border border-[#D4AF37]"
          >
            Buka di Google Maps
          </a>
        </section>

        <BatikDivider className="w-48" />

        {/* Dress code */}
        <section className="text-center space-y-3">
          <h2 className="text-2xl italic" style={display}>
            Dress Code
          </h2>
          <p className="text-lg tracking-[0.2em] uppercase" style={display}>
            Batik
          </p>
          <div className="flex justify-center gap-3">
            {['#8B4513', '#D4AF37', '#FDF6E3', '#3D2B1F'].map((c) => (
              <span key={c} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
        </section>

        <BatikDivider className="w-48" />

        {/* Cerita Kami */}
        <section className="space-y-6">
          <h2 className="text-center text-2xl italic" style={display}>
            Cerita Kami
          </h2>
          <div className="relative pl-6 space-y-8 border-l-2 border-dotted border-[#D4AF37]">
            {LOVE_STORY.map((item) => (
              <div key={item.title} className="relative">
                <span className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full bg-[#8B4513] border-2 border-[#FDF6E3]" />
                <p className="text-[10px] tracking-widest uppercase opacity-60">{item.year}</p>
                <h4 className="font-semibold text-sm mt-0.5">{item.title}</h4>
                <p className="text-xs opacity-70 leading-relaxed mt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <BatikDivider className="w-48" />

        {/* Gallery */}
        <section className="space-y-4">
          <h2 className="text-center text-2xl italic" style={display}>
            Galeri Foto
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {GALLERY_LABELS.map((label) => (
              <PlaceholderPhoto key={label} label={label} className="aspect-square rounded-md" />
            ))}
          </div>
        </section>

        <BatikDivider className="w-48" />

        {/* Doa & Ucapan */}
        <section className="space-y-5">
          <h2 className="text-center text-2xl italic" style={display}>
            Doa &amp; Ucapan
          </h2>

          <form onSubmit={submitWish} className="bg-white/70 border border-[#D4AF37]/40 rounded-xl p-5 space-y-3">
            <input
              type="text"
              required
              value={wishForm.name}
              onChange={(e) => setWishForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nama Anda"
              className="w-full bg-white border border-[#D4AF37]/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
            />
            <select
              value={wishForm.attendance}
              onChange={(e) => setWishForm((f) => ({ ...f, attendance: e.target.value as Wish['attendance'] }))}
              className="w-full bg-white border border-[#D4AF37]/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
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
              className="w-full bg-white border border-[#D4AF37]/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513] resize-none"
            />
            <button
              type="submit"
              className="w-full bg-[#8B4513] hover:bg-[#6e360f] text-[#FDF6E3] text-xs tracking-widest uppercase font-semibold py-3 rounded-full transition-colors"
            >
              {wishSubmitted ? 'Terkirim!' : 'Kirim Ucapan'}
            </button>
          </form>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {wishes.map((w) => (
              <div key={w.id} className="bg-white/60 rounded-lg p-4 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{w.name}</span>
                  <span className="text-[9px] tracking-widest uppercase text-[#8B4513] bg-[#D4AF37]/20 px-2 py-0.5 rounded-full">
                    {w.attendance}
                  </span>
                </div>
                <p className="text-xs opacity-70 leading-relaxed">{w.message}</p>
              </div>
            ))}
          </div>
        </section>

        <BatikDivider className="w-48" />

        {/* Tanda Kasih */}
        <section className="space-y-4">
          <h2 className="text-center text-2xl italic" style={display}>
            Tanda Kasih
          </h2>
          <p className="text-center text-xs opacity-70 max-w-sm mx-auto leading-relaxed">
            Doa restu Anda adalah karunia yang berarti bagi kami. Jika ingin memberi tanda kasih, kami dengan
            senang hati menerimanya melalui:
          </p>
          <div className="space-y-3">
            {BANK_ACCOUNTS.map((acc) => (
              <div key={acc.bank} className="flex items-center justify-between bg-white/70 border border-[#D4AF37]/40 rounded-lg px-4 py-3">
                <div>
                  <p className="font-semibold text-sm">{acc.bank}</p>
                  <p className="text-xs opacity-70 tracking-wider">{acc.number}</p>
                  <p className="text-[10px] opacity-50 uppercase tracking-widest">a.n {acc.holder}</p>
                </div>
                <button
                  onClick={() => copyAccount(acc.number, acc.bank)}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold text-[#8B4513] border border-[#D4AF37]/60 px-3 py-2 rounded-full hover:bg-[#D4AF37]/10 transition-colors"
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
          <BatikDivider className="w-48" />
          <p className="text-sm opacity-70 max-w-xs mx-auto leading-relaxed pt-2">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan
            memberikan doa restu.
          </p>
          <h3 className="text-2xl italic" style={display}>
            Ratu &amp; Fadil
          </h3>
          <div className="pt-8 text-[10px] tracking-widest uppercase opacity-40">
            Dibuat oleh{' '}
            <Link to="/" className="underline hover:opacity-70">
              nicemice
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
