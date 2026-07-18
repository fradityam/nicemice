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

const EVENT_DATE = new Date('2027-02-14T08:00:00+07:00');
const LOCATION_NAME = 'The Hall Kemang';
const LOCATION_ADDRESS = 'Jl. Kemang Raya No. 10, Jakarta Selatan';
const MAPS_QUERY = encodeURIComponent(`${LOCATION_NAME}, ${LOCATION_ADDRESS}`);

const display = { fontFamily: "'Poppins', sans-serif" };

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

/** Minimal L-shaped corner bracket used to frame the cover card. */
function CornerBracket({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <path d="M1 27 L1 1 L27 1" stroke="#C9A84C" strokeWidth="1.5" />
    </svg>
  );
}

/** Thin line + rotated square divider used between every section. */
function GeometricDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 w-full max-w-[160px] mx-auto ${className}`}>
      <span className="h-px flex-1 bg-[#C9A84C]/40" />
      <span className="w-2 h-2 border border-[#C9A84C] rotate-45" />
      <span className="h-px flex-1 bg-[#C9A84C]/40" />
    </div>
  );
}

function PlaceholderPhoto({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#EDF2EC] via-[#DCE6DA] to-[#B2C5B0]/60 text-[#6B7F68] border border-[#C9A84C]/30 ${className}`}
    >
      <Camera className="w-6 h-6 opacity-60" />
      <span className="text-[9px] tracking-[0.25em] uppercase opacity-60" style={display}>
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
  { id: 1, name: 'Dinda & Aji', attendance: 'Hadir', message: 'Selamat menikah Ratu & Fadil! Simple, elegant, so you two. Congrats!' },
  { id: 2, name: 'Michael Tan', attendance: 'Hadir', message: 'Wishing you both a lifetime of quiet, beautiful moments together.' },
];

const LOVE_STORY = [
  { year: '2020', title: 'Pertama Bertemu', text: 'Ratu & Fadil dipertemukan lewat proyek desain yang sama dan langsung nyambung soal selera.' },
  { year: '2022', title: 'Berkomitmen', text: 'Dari rekan kerja menjadi pasangan — memilih membangun hidup yang tenang dan bermakna bersama.' },
  { year: '2025', title: 'Melamar', text: 'Fadil melamar Ratu di sore yang sederhana, tanpa banyak drama, persis seperti yang mereka suka.' },
  { year: '2027', title: 'Menikah', text: 'Kini saatnya Ratu & Fadil merayakan babak baru sebagai suami istri.' },
];

const GALLERY_LABELS = ['Momen 1', 'Momen 2', 'Momen 3', 'Momen 4', 'Momen 5', 'Momen 6'];

const BANK_ACCOUNTS = [
  { bank: 'Bank BCA', number: '8873456120', holder: 'Ratu' },
  { bank: 'Bank Mandiri', number: '1122334455', holder: 'Ratu' },
];

export default function SageTemplate() {
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
    <div className="min-h-screen bg-[#B2C5B0] text-[#2D2D2D]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Back to site link */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-[60] flex items-center gap-1.5 bg-white/80 hover:bg-white text-[#2D2D2D] backdrop-blur-sm text-[10px] tracking-[0.2em] uppercase font-medium px-3 py-2 rounded-sm shadow-sm transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        nicemice
      </Link>

      {/* ============ COVER ============ */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-[#B2C5B0] transition-all duration-700 ease-in-out ${
          isOpened ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <p className="absolute top-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.35em] uppercase opacity-60" style={display}>
          Save The Date
        </p>

        {/* Clean white card with corner brackets */}
        <div className="relative w-full max-w-[320px] py-14 px-8">
          <CornerBracket className="absolute -top-2 -left-2 w-8 h-8" />
          <CornerBracket className="absolute -top-2 -right-2 w-8 h-8 rotate-90" />
          <CornerBracket className="absolute -bottom-2 -left-2 w-8 h-8 -rotate-90" />
          <CornerBracket className="absolute -bottom-2 -right-2 w-8 h-8 rotate-180" />

          <div className="bg-white border border-[#C9A84C]/50 shadow-sm px-8 py-12 text-center flex flex-col items-center gap-5">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[0.08em] uppercase" style={display}>
              Ratu <span className="text-[#C9A84C] font-normal normal-case italic">&amp;</span> Fadil
            </h1>
            <GeometricDivider />
            <p className="text-xs tracking-[0.25em] uppercase opacity-70">14 Februari 2027</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase opacity-60 mb-1">Kepada Yth.</p>
          <p className="text-lg font-semibold" style={display}>
            {guestName}
          </p>
        </div>

        <button
          onClick={() => setIsOpened(true)}
          className="mt-8 bg-[#2D2D2D] hover:bg-[#C9A84C] text-white text-[11px] tracking-[0.3em] uppercase font-medium px-9 py-4 shadow-md transition-all hover:scale-[1.02] active:scale-95"
        >
          Buka Undangan
        </button>
      </div>

      {/* ============ FULL INVITATION ============ */}
      <div className="max-w-lg mx-auto px-5 sm:px-8 pt-24 pb-16 space-y-14">
        {/* Photos */}
        <section className="grid grid-cols-2 gap-3 pt-4">
          <PlaceholderPhoto label="Ratu & Fadil" className="aspect-[3/4] border" />
          <PlaceholderPhoto label="Bersama" className="aspect-[3/4] border mt-6" />
        </section>

        <GeometricDivider />

        {/* Love quote */}
        <section className="text-center space-y-4">
          <p className="italic text-base leading-relaxed max-w-sm mx-auto text-[#2D2D2D]/80">
            &quot;Kebahagiaan sejati bukan tentang kemewahan, tapi tentang menemukan ketenangan bersama orang yang tepat.&quot;
          </p>
        </section>

        <GeometricDivider />

        {/* Bismillah opening */}
        <section className="text-center space-y-3">
          <h2 className="text-lg tracking-[0.08em]" style={display}>
            Bismillahirrahmanirrahim
          </h2>
          <p className="text-[10px] tracking-[0.25em] uppercase opacity-60">
            Assalamu&apos;alaikum Warahmatullahi Wabarakatuh
          </p>
          <p className="text-sm leading-relaxed max-w-sm mx-auto opacity-80">
            Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan kami dan
            mengharap kehadiran Bapak/Ibu/Saudara/i pada hari bahagia kami.
          </p>
        </section>

        <GeometricDivider />

        {/* Bride & Groom */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="text-center space-y-3">
            <PlaceholderPhoto label="Ratu" className="w-28 h-28 mx-auto border" />
            <h3 className="text-xl tracking-[0.05em]" style={display}>
              Ratu
            </h3>
            <p className="text-xs opacity-70 leading-relaxed">
              Putri dari
              <br />
              Bpk. Kayo &amp; Ibu Dewi Sudiar
            </p>
          </div>
          <div className="text-center space-y-3">
            <PlaceholderPhoto label="Fadil" className="w-28 h-28 mx-auto border" />
            <h3 className="text-xl tracking-[0.05em]" style={display}>
              Fadil
            </h3>
            <p className="text-xs opacity-70 leading-relaxed">
              Putra dari
              <br />
              Bpk. Soelistiyono &amp; Ibu Sekar Mayangsari
            </p>
          </div>
        </section>

        <GeometricDivider />

        {/* Event details */}
        <section className="space-y-6">
          <h2 className="text-center text-2xl tracking-[0.05em]" style={display}>
            Acara Pernikahan
          </h2>
          <p className="text-center text-xs tracking-[0.2em] uppercase opacity-60">{eventDateLabel}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-[#C9A84C]/40 p-5 text-center space-y-2">
              <Calendar className="w-5 h-5 mx-auto text-[#C9A84C]" />
              <h4 className="font-semibold text-sm">Akad Nikah</h4>
              <p className="text-xs opacity-70 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> 08.00 WIB
              </p>
            </div>
            <div className="bg-white border border-[#C9A84C]/40 p-5 text-center space-y-2">
              <Calendar className="w-5 h-5 mx-auto text-[#C9A84C]" />
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
              <div key={unit.label} className="bg-white border border-[#C9A84C]/40 py-3 text-center">
                <div className="text-xl sm:text-2xl font-semibold text-[#C9A84C]" style={display}>
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="text-[9px] tracking-[0.2em] uppercase opacity-60 mt-1">{unit.label}</div>
              </div>
            ))}
          </div>
        </section>

        <GeometricDivider />

        {/* Location */}
        <section className="space-y-4">
          <h2 className="text-center text-2xl tracking-[0.05em]" style={display}>
            Lokasi Acara
          </h2>
          <div className="text-center space-y-1">
            <p className="font-semibold text-sm flex items-center justify-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C9A84C]" /> {LOCATION_NAME}
            </p>
            <p className="text-xs opacity-70">{LOCATION_ADDRESS}</p>
          </div>
          <div className="border border-[#C9A84C]/40 overflow-hidden">
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
            className="block text-center bg-[#2D2D2D] hover:bg-[#C9A84C] text-white text-[11px] tracking-[0.3em] uppercase font-medium py-3.5 transition-colors"
          >
            Buka di Google Maps
          </a>
        </section>

        <GeometricDivider />

        {/* Dress code */}
        <section className="text-center space-y-3">
          <h2 className="text-2xl tracking-[0.05em]" style={display}>
            Dress Code
          </h2>
          <p className="text-lg tracking-[0.25em] uppercase" style={display}>
            Formal Earth Tone
          </p>
          <div className="flex justify-center gap-3">
            {['#B2C5B0', '#C9A84C', '#FFFFFF', '#2D2D2D'].map((c) => (
              <span key={c} className="w-8 h-8 border-2 border-[#C9A84C]/40 shadow-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
        </section>

        <GeometricDivider />

        {/* Cerita Kami */}
        <section className="space-y-6">
          <h2 className="text-center text-2xl tracking-[0.05em]" style={display}>
            Cerita Kami
          </h2>
          <div className="relative pl-6 space-y-8 border-l border-[#C9A84C]/40">
            {LOVE_STORY.map((item) => (
              <div key={item.title} className="relative">
                <span className="absolute -left-[25px] top-1 w-2 h-2 border border-[#C9A84C] rotate-45 bg-white" />
                <p className="text-[10px] tracking-[0.25em] uppercase opacity-60" style={display}>
                  {item.year}
                </p>
                <h4 className="font-semibold text-sm mt-0.5">{item.title}</h4>
                <p className="text-xs opacity-70 leading-relaxed mt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <GeometricDivider />

        {/* Gallery */}
        <section className="space-y-4">
          <h2 className="text-center text-2xl tracking-[0.05em]" style={display}>
            Galeri Foto
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {GALLERY_LABELS.map((label) => (
              <PlaceholderPhoto key={label} label={label} className="aspect-square border" />
            ))}
          </div>
        </section>

        <GeometricDivider />

        {/* Doa & Ucapan */}
        <section className="space-y-5">
          <h2 className="text-center text-2xl tracking-[0.05em]" style={display}>
            Doa &amp; Ucapan
          </h2>

          <form onSubmit={submitWish} className="bg-white border border-[#C9A84C]/40 p-5 space-y-3">
            <input
              type="text"
              required
              value={wishForm.name}
              onChange={(e) => setWishForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nama Anda"
              className="w-full bg-white border border-[#C9A84C]/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
            />
            <select
              value={wishForm.attendance}
              onChange={(e) => setWishForm((f) => ({ ...f, attendance: e.target.value as Wish['attendance'] }))}
              className="w-full bg-white border border-[#C9A84C]/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
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
              className="w-full bg-white border border-[#C9A84C]/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C] resize-none"
            />
            <button
              type="submit"
              className="w-full bg-[#2D2D2D] hover:bg-[#C9A84C] text-white text-[11px] tracking-[0.3em] uppercase font-medium py-3.5 transition-colors"
            >
              {wishSubmitted ? 'Terkirim!' : 'Kirim Ucapan'}
            </button>
          </form>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {wishes.map((w) => (
              <div key={w.id} className="bg-white/70 border border-[#C9A84C]/20 p-4 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{w.name}</span>
                  <span className="text-[9px] tracking-[0.2em] uppercase text-[#C9A84C] border border-[#C9A84C]/40 px-2 py-0.5">
                    {w.attendance}
                  </span>
                </div>
                <p className="text-xs opacity-70 leading-relaxed">{w.message}</p>
              </div>
            ))}
          </div>
        </section>

        <GeometricDivider />

        {/* Tanda Kasih */}
        <section className="space-y-4">
          <h2 className="text-center text-2xl tracking-[0.05em]" style={display}>
            Tanda Kasih
          </h2>
          <p className="text-center text-xs opacity-70 max-w-sm mx-auto leading-relaxed">
            Doa restu Anda adalah karunia yang berarti bagi kami. Jika ingin memberi tanda kasih, kami dengan
            senang hati menerimanya melalui:
          </p>
          <div className="space-y-3">
            {BANK_ACCOUNTS.map((acc) => (
              <div key={acc.bank} className="flex items-center justify-between bg-white border border-[#C9A84C]/40 px-4 py-3">
                <div>
                  <p className="font-semibold text-sm">{acc.bank}</p>
                  <p className="text-xs opacity-70 tracking-wider">{acc.number}</p>
                  <p className="text-[10px] opacity-50 uppercase tracking-widest">a.n {acc.holder}</p>
                </div>
                <button
                  onClick={() => copyAccount(acc.number, acc.bank)}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] font-medium text-[#2D2D2D] border border-[#C9A84C]/50 px-3 py-2 hover:bg-[#C9A84C]/10 transition-colors"
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
          <GeometricDivider />
          <p className="text-sm opacity-70 max-w-xs mx-auto leading-relaxed pt-2">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan
            memberikan doa restu.
          </p>
          <h3 className="text-2xl tracking-[0.08em] uppercase" style={display}>
            Ratu &amp; Fadil
          </h3>
          <div className="pt-8 text-[10px] tracking-[0.25em] uppercase opacity-40">
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
