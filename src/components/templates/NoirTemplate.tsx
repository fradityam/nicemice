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

const EVENT_DATE = new Date('2026-12-31T16:00:00+07:00');
const LOCATION_NAME = 'Grand Ballroom, Hotel Mulia Senayan';
const LOCATION_ADDRESS = 'Jl. Asia Afrika, Jakarta';
const MAPS_QUERY = encodeURIComponent(`${LOCATION_NAME}, ${LOCATION_ADDRESS}`);

const display = { fontFamily: "'Cormorant Garamond', serif" };

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

const PETAL_COUNT = 16;

/** Radial line-art wreath used behind the cover card's couple names. */
function FloralOutline({ className }: { className?: string }) {
  const petals = Array.from({ length: PETAL_COUNT }, (_, i) => {
    const angle = (i / PETAL_COUNT) * Math.PI * 2;
    const x1 = 100 + Math.cos(angle) * 62;
    const y1 = 100 + Math.sin(angle) * 62;
    const x2 = 100 + Math.cos(angle) * 92;
    const y2 = 100 + Math.sin(angle) * 92;
    const cx = 100 + Math.cos(angle + 0.18) * 78;
    const cy = 100 + Math.sin(angle + 0.18) * 78;
    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  });
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      <circle cx="100" cy="100" r="62" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" />
      {petals.map((d, i) => (
        <path key={i} d={d} stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1.2" />
      ))}
    </svg>
  );
}

/** Thin gold line + 4-point sparkle used as a section divider. */
function GoldStarDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 w-full max-w-[180px] mx-auto ${className}`}>
      <span className="h-px flex-1 bg-[#D4AF37]/40" />
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#D4AF37]" fill="currentColor">
        <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
      </svg>
      <span className="h-px flex-1 bg-[#D4AF37]/40" />
    </div>
  );
}

function PlaceholderPhoto({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1A1A2E] via-[#20203A] to-[#0A1628] text-[#D4AF37] border border-[#D4AF37]/30 ${className}`}
    >
      <Camera className="w-6 h-6 opacity-70" />
      <span className="text-[9px] tracking-[0.25em] uppercase opacity-70" style={display}>
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
  { id: 1, name: 'Diana & Richard', attendance: 'Hadir', message: 'Selamat menikah Ratu & Fadil! A night as glamorous as you both. Can’t wait to celebrate!' },
  { id: 2, name: 'Priscilla Wongso', attendance: 'Hadir', message: 'Wishing you a lifetime of elegance and endless love. Congratulations!' },
];

const LOVE_STORY = [
  { year: '2017', title: 'Pertama Bertemu', text: 'Ratu & Fadil bertemu di sebuah gala amal dan menghabiskan malam itu berbincang tanpa henti.' },
  { year: '2020', title: 'Berkomitmen', text: 'Perjalanan mereka membawa keduanya semakin yakin untuk membangun masa depan bersama.' },
  { year: '2025', title: 'Melamar', text: 'Fadil melamar Ratu di puncak menara kota, disaksikan gemerlap lampu malam.' },
  { year: '2026', title: 'Menikah', text: 'Malam pergantian tahun ini, Ratu & Fadil resmi menjadi suami istri.' },
];

const GALLERY_LABELS = ['Momen 1', 'Momen 2', 'Momen 3', 'Momen 4', 'Momen 5', 'Momen 6'];

const BANK_ACCOUNTS = [
  { bank: 'Bank BCA', number: '7712345690', holder: 'Ratu' },
  { bank: 'Bank Mandiri', number: '3345678901', holder: 'Ratu' },
];

export default function NoirTemplate() {
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
    <div className="min-h-screen bg-[#0A1628] text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Back to site link */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-[60] flex items-center gap-1.5 bg-[#1A1A2E]/80 hover:bg-[#1A1A2E] text-[#D4AF37] backdrop-blur-sm text-[10px] tracking-widest uppercase font-semibold px-3 py-2 rounded-full shadow-sm transition-colors border border-[#D4AF37]/30"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        nicemice
      </Link>

      {/* ============ COVER ============ */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-[#0A1628] transition-all duration-700 ease-in-out ${
          isOpened ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <p className="absolute top-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.35em] uppercase text-[#D4AF37]/80">
          Save The Date
        </p>

        {/* Dark charcoal card with gold border + floral outline */}
        <div className="relative w-full max-w-[320px] aspect-square">
          <div className="absolute inset-0 rounded-full bg-[#1A1A2E] border border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.15)]" />
          <FloralOutline className="absolute inset-0 w-full h-full" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8 gap-4">
            <h1 className="text-3xl sm:text-4xl leading-snug" style={display}>
              Ratu
              <br />
              <span className="text-[#D4AF37] text-xl">&amp;</span>
              <br />
              Fadil
            </h1>
            <p className="text-xs tracking-[0.3em] uppercase text-[#D4AF37]">31 Desember 2026</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/50 mb-1">Kepada Yth.</p>
          <p className="text-lg font-semibold" style={display}>
            {guestName}
          </p>
        </div>

        <button
          onClick={() => setIsOpened(true)}
          className="mt-8 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A1628] text-xs tracking-[0.3em] uppercase font-semibold px-9 py-4 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          Buka Undangan
        </button>
      </div>

      {/* ============ FULL INVITATION ============ */}
      <div className="max-w-lg mx-auto px-5 sm:px-8 pt-24 pb-16 space-y-14">
        {/* Photos */}
        <section className="grid grid-cols-2 gap-3 pt-4">
          <PlaceholderPhoto label="Ratu & Fadil" className="aspect-[3/4] rounded" />
          <PlaceholderPhoto label="Bersama" className="aspect-[3/4] rounded mt-6" />
        </section>

        <GoldStarDivider />

        {/* Love quote */}
        <section className="text-center space-y-4">
          <p className="italic text-base leading-relaxed max-w-sm mx-auto text-white/80" style={display}>
            &quot;Cinta sejati adalah menemukan keindahan dalam kesederhanaan, bahkan di tengah gemerlapnya
            dunia.&quot;
          </p>
        </section>

        <GoldStarDivider />

        {/* Bismillah opening */}
        <section className="text-center space-y-3">
          <h2 className="text-lg" style={display}>
            Bismillahirrahmanirrahim
          </h2>
          <p className="text-[10px] tracking-widest uppercase text-white/50">
            Assalamu&apos;alaikum Warahmatullahi Wabarakatuh
          </p>
          <p className="text-sm leading-relaxed max-w-sm mx-auto text-white/70">
            Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan kami dan
            mengharap kehadiran Bapak/Ibu/Saudara/i pada hari bahagia kami.
          </p>
        </section>

        <GoldStarDivider />

        {/* Bride & Groom */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="text-center space-y-3">
            <PlaceholderPhoto label="Ratu" className="w-28 h-28 rounded-full mx-auto border-2 border-[#D4AF37]" />
            <h3 className="text-xl" style={display}>
              Ratu
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Putri dari
              <br />
              Bpk. Kayo &amp; Ibu Dewi Sudiar
            </p>
          </div>
          <div className="text-center space-y-3">
            <PlaceholderPhoto label="Fadil" className="w-28 h-28 rounded-full mx-auto border-2 border-[#D4AF37]" />
            <h3 className="text-xl" style={display}>
              Fadil
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Putra dari
              <br />
              Bpk. Soelistiyono &amp; Ibu Sekar Mayangsari
            </p>
          </div>
        </section>

        <GoldStarDivider />

        {/* Event details */}
        <section className="space-y-6">
          <h2 className="text-center text-2xl" style={display}>
            Acara Pernikahan
          </h2>
          <p className="text-center text-xs tracking-widest uppercase text-white/50">{eventDateLabel}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1A1A2E] border border-[#D4AF37]/40 rounded-xl p-5 text-center space-y-2">
              <Calendar className="w-5 h-5 mx-auto text-[#D4AF37]" />
              <h4 className="font-semibold text-sm">Akad Nikah</h4>
              <p className="text-xs text-white/60 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> 16.00 WIB
              </p>
            </div>
            <div className="bg-[#1A1A2E] border border-[#D4AF37]/40 rounded-xl p-5 text-center space-y-2">
              <Calendar className="w-5 h-5 mx-auto text-[#D4AF37]" />
              <h4 className="font-semibold text-sm">Resepsi</h4>
              <p className="text-xs text-white/60 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> 19.00 WIB
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
              <div key={unit.label} className="bg-[#1A1A2E] border border-[#D4AF37]/50 rounded-lg py-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-[#D4AF37]" style={display}>
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="text-[9px] tracking-[0.15em] uppercase text-white/50 mt-1">{unit.label}</div>
              </div>
            ))}
          </div>
        </section>

        <GoldStarDivider />

        {/* Location */}
        <section className="space-y-4">
          <h2 className="text-center text-2xl" style={display}>
            Lokasi Acara
          </h2>
          <div className="text-center space-y-1">
            <p className="font-semibold text-sm flex items-center justify-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D4AF37]" /> {LOCATION_NAME}
            </p>
            <p className="text-xs text-white/60">{LOCATION_ADDRESS}</p>
          </div>
          <div className="rounded-xl overflow-hidden border border-[#D4AF37]/40 shadow-sm">
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
            className="block text-center border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A1628] text-xs tracking-widest uppercase font-semibold py-3 rounded-full transition-colors"
          >
            Buka di Google Maps
          </a>
        </section>

        <GoldStarDivider />

        {/* Dress code */}
        <section className="text-center space-y-3">
          <h2 className="text-2xl" style={display}>
            Dress Code
          </h2>
          <p className="text-lg tracking-[0.25em] uppercase text-[#D4AF37]" style={display}>
            Black Tie
          </p>
          <div className="flex justify-center gap-3">
            {['#0A1628', '#1A1A2E', '#D4AF37', '#FFFFFF'].map((c) => (
              <span key={c} className="w-8 h-8 rounded-full border-2 border-[#D4AF37]/50 shadow-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
        </section>

        <GoldStarDivider />

        {/* Cerita Kami */}
        <section className="space-y-6">
          <h2 className="text-center text-2xl" style={display}>
            Cerita Kami
          </h2>
          <div className="relative pl-6 space-y-8 border-l border-[#D4AF37]/40">
            {LOVE_STORY.map((item) => (
              <div key={item.title} className="relative">
                <span className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-[#D4AF37]" />
                <p className="text-[10px] tracking-widest uppercase text-white/50">{item.year}</p>
                <h4 className="font-semibold text-sm mt-0.5">{item.title}</h4>
                <p className="text-xs text-white/60 leading-relaxed mt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <GoldStarDivider />

        {/* Gallery */}
        <section className="space-y-4">
          <h2 className="text-center text-2xl" style={display}>
            Galeri Foto
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {GALLERY_LABELS.map((label) => (
              <PlaceholderPhoto key={label} label={label} className="aspect-square rounded" />
            ))}
          </div>
        </section>

        <GoldStarDivider />

        {/* Doa & Ucapan */}
        <section className="space-y-5">
          <h2 className="text-center text-2xl" style={display}>
            Doa &amp; Ucapan
          </h2>

          <form onSubmit={submitWish} className="bg-[#1A1A2E] border border-[#D4AF37]/40 rounded-xl p-5 space-y-3">
            <input
              type="text"
              required
              value={wishForm.name}
              onChange={(e) => setWishForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nama Anda"
              className="w-full bg-[#0A1628] border border-[#D4AF37]/40 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            />
            <select
              value={wishForm.attendance}
              onChange={(e) => setWishForm((f) => ({ ...f, attendance: e.target.value as Wish['attendance'] }))}
              className="w-full bg-[#0A1628] border border-[#D4AF37]/40 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
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
              className="w-full bg-[#0A1628] border border-[#D4AF37]/40 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none"
            />
            <button
              type="submit"
              className="w-full border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A1628] text-xs tracking-widest uppercase font-semibold py-3 rounded-full transition-colors"
            >
              {wishSubmitted ? 'Terkirim!' : 'Kirim Ucapan'}
            </button>
          </form>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {wishes.map((w) => (
              <div key={w.id} className="bg-[#1A1A2E]/70 rounded-lg p-4 text-left border border-[#D4AF37]/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{w.name}</span>
                  <span className="text-[9px] tracking-widest uppercase text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full">
                    {w.attendance}
                  </span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">{w.message}</p>
              </div>
            ))}
          </div>
        </section>

        <GoldStarDivider />

        {/* Tanda Kasih */}
        <section className="space-y-4">
          <h2 className="text-center text-2xl" style={display}>
            Tanda Kasih
          </h2>
          <p className="text-center text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
            Doa restu Anda adalah karunia yang berarti bagi kami. Jika ingin memberi tanda kasih, kami dengan
            senang hati menerimanya melalui:
          </p>
          <div className="space-y-3">
            {BANK_ACCOUNTS.map((acc) => (
              <div key={acc.bank} className="flex items-center justify-between bg-[#1A1A2E] border border-[#D4AF37]/40 rounded-lg px-4 py-3">
                <div>
                  <p className="font-semibold text-sm">{acc.bank}</p>
                  <p className="text-xs text-white/60 tracking-wider">{acc.number}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">a.n {acc.holder}</p>
                </div>
                <button
                  onClick={() => copyAccount(acc.number, acc.bank)}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold text-[#D4AF37] border border-[#D4AF37]/50 px-3 py-2 rounded-full hover:bg-[#D4AF37]/10 transition-colors"
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
          <GoldStarDivider />
          <p className="text-sm text-white/60 max-w-xs mx-auto leading-relaxed pt-2">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan
            memberikan doa restu.
          </p>
          <h3 className="text-2xl" style={display}>
            Ratu &amp; Fadil
          </h3>
          <div className="pt-8 text-[10px] tracking-widest uppercase text-white/30">
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
