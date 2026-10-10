import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { weddingDateId, weddingDateIdLong } from './notebookWeddingDate';
import { MadeWithLoveFooter } from './MadeWithLoveFooter';
import { Float, Reveal, RevealProvider, useScrollReveals } from './scrollReveal';

// Every layer is placed at its position in the Figma "Content" frame, in Figma's layer order,
// and the whole frame is scaled to the column width. The frame is 375 × 4010 with the
// "Made with love" footer; the layers above it were laid out (many with % insets) when it was
// 375 × 3941, so that stays the frame box and the footer extends below it to PAGE_H.
const FRAME_W = 375;
const FRAME_H = 3941;
const PAGE_H = 4010;

const assetUrls = import.meta.glob('../../assets/images/notebook/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const A = (file: string) => assetUrls[`../../assets/images/notebook/${file}`];

const mask = (file: string, position: string, size: string): CSSProperties => {
  const url = `url("${A(file)}")`;
  return {
    maskImage: url,
    WebkitMaskImage: url,
    maskMode: 'alpha',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: position,
    WebkitMaskPosition: position,
    maskSize: size,
    WebkitMaskSize: size,
  };
};

/** Subtle one-time reveals on the cover and as sections scroll into view. Set to false to turn them all off. */
export const ENABLE_ANIMATIONS = true;

const ADDRESS =
  'Allie H., Jl. Anggrek Loka No. 24, RT 005 / RW 002 Kel. Meruya Utara, Kec. Kembangan Jakarta Barat, DKI Jakarta, 11620. No. HP: 0812-3456-7890';

const mapsUrl =(place: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

/** Cover → content transition (shared with the template). */
export const INTRO = {
  EASE_OUT: 'cubic-bezier(0.33, 1, 0.68, 1)',
  COVER_FADE_MS: 1000,
  CONTENT_DELAY_MS: 150,
  CONTENT_MS: 900,
  CONTENT_RISE_PX: 24,
  REDUCED_FADE_MS: 300,
  get TOTAL_MS() {
    return Math.max(this.COVER_FADE_MS, this.CONTENT_DELAY_MS + this.CONTENT_MS);
  },
};
export type IntroState = { revealed: boolean; reducedMotion: boolean };

function introStyle({ revealed, reducedMotion }: IntroState): CSSProperties {
  if (reducedMotion) return {};
  if (!revealed) return { opacity: 0, transform: `translateY(${INTRO.CONTENT_RISE_PX}px)` };
  const t = `${INTRO.CONTENT_MS}ms ${INTRO.EASE_OUT} ${INTRO.CONTENT_DELAY_MS}ms`;
  return { opacity: 1, transform: 'translateY(0)', transition: `opacity ${t}, transform ${t}` };
}

/** Plain image layer at a Figma box, object-cover like the Figma fill. */
function Img({ file, x, y, w, h, flip, alt = '' }: { file: string; x: number; y: number; w: number; h: number; flip?: boolean; alt?: string }) {
  return (
    <img
      alt={alt}
      src={A(file)}
      className={`absolute max-w-none object-cover ${flip ? '-scale-x-100' : ''}`}
      style={{ left: x, top: y, width: w, height: h }}
    />
  );
}

/** Text centred on a Figma text box. */
function Centered({ x, y, w, h, className, style, children }: { x: number; y: number; w: number; h: number; className: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div
      className={`-translate-x-1/2 -translate-y-1/2 absolute text-center whitespace-nowrap ${className}`}
      style={{ left: x + w / 2, top: y + h / 2, ...style }}
    >
      {children}
    </div>
  );
}

/** Stamp-edged card: outer stamp + inner panel, both rotated -90° inside their boxes. */
function StampCard({ outer, inner, outerFile, innerFile }: { outer: string; inner: string; outerFile: string; innerFile: string }) {
  return (
    <>
      {[[outer, outerFile], [inner, innerFile]].map(([inset, file]) => (
        <div key={file} className={`absolute flex ${inset} items-center justify-center`} style={{ containerType: 'size' }}>
          <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
            <div className="relative size-full">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={A(file)} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function LihatLokasi({ top, color, place }: { top: number; color: string; place: string }) {
  return (
    <a
      href={mapsUrl(place)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Lihat lokasi ${place} di Google Maps`}
      className="absolute left-[138px] h-[24px] w-[100px] rounded-[100px]"
      style={{ top, backgroundColor: color }}
    >
      <span className="absolute left-[9px] top-[4px] size-[15px] overflow-clip">
        <span className="absolute inset-[0_14.58%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('pin.svg')} />
        </span>
      </span>
      <span className="-translate-x-1/2 -translate-y-1/2 absolute left-[58px] top-[12px] font-['Raleway'] text-[12px] leading-[20px] tracking-[-0.204px] text-white whitespace-nowrap">
        Lihat Lokasi
      </span>
    </a>
  );
}

function SalinButton({ top, label, text }: { top: number; label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="absolute left-[156px] h-[22px] w-[64px] cursor-pointer rounded-[20px] border border-solid border-[#accadd] bg-[#efecec]"
      style={{ top }}
    >
      {!copied && <img alt="" src={A('copy.svg')} className="absolute block max-w-none" style={{ left: 9.01, top: 3.33, width: 10.99, height: 13.47 }} />}
      {/* "TERSALIN" is wider than the button's text slot, so it replaces the icon and centres. */}
      <span
        className="-translate-x-1/2 -translate-y-1/2 absolute top-[10.5px] font-['Raleway'] text-[10px] leading-[15px] tracking-[-0.17px] text-[#29567f] whitespace-nowrap"
        style={{ left: copied ? 31 : 38.5 }}
      >
        {copied ? 'TERSALIN' : 'SALIN'}
      </span>
    </button>
  );
}

// ---------- Photo collage + lightbox ----------

const PREWED = [
  { large: 'prewed-1-lg.webp', button: 'inset-[44.03%_59.22%_51.17%_5.24%]' },
  { large: 'prewed-2-lg.webp', button: 'inset-[43.97%_32.39%_53.64%_42.31%]' },
  { large: 'prewed-3-lg.webp', button: 'inset-[43.97%_4.99%_53.62%_69.52%]' },
  { large: 'prewed-4-lg.webp', button: 'inset-[46.43%_19.41%_51.08%_43.47%]' },
];

function Lightbox({ index, onClose }: { index: number; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto pre-wedding ${index + 1}`}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <img
        alt={`Foto pre-wedding Noah & Allie ${index + 1}`}
        src={A(PREWED[index].large)}
        className="max-h-[88vh] max-w-full rounded-lg object-contain"
      />
      <button
        ref={closeRef}
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white"
      >
        ×
      </button>
    </div>
  );
}

// ---------- RSVP ----------

const ATTENDANCE = [
  { value: 'hadir', label: 'Akan Hadir', top: 2548 },
  { value: 'mungkin', label: 'Mungkin Hadir', top: 2591 },
  { value: 'berhalangan', label: 'Berhalangan Hadir', top: 2634 },
];
const fieldLabel = "-translate-y-1/2 absolute left-[44px] font-['Raleway'] font-medium text-[12px] leading-[20px] tracking-[-0.204px] text-black whitespace-nowrap";
const fieldBox = 'absolute left-[37px] w-[302px] rounded-[10px] border border-solid border-[#aba935] bg-white';
const fieldText = "font-['Raleway'] font-medium text-[12px] leading-[20px] tracking-[-0.204px] text-black placeholder:text-[rgba(0,0,0,0.2)] outline-none";

function Rsvp() {
  const [attendance, setAttendance] = useState('hadir');
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Centered x={0} y={2416} w={376} h={20} className="font-['La_Belle_Aurore'] text-[18px] leading-[20px] tracking-[-0.306px] text-[#324532]">
        Konfirmasi Kehadiran
      </Centered>

      <label htmlFor="nb-nama" className={fieldLabel} style={{ top: 2457 }}>Nama</label>
      <input id="nb-nama" name="nama" placeholder="Nama Anda" className={`${fieldBox} ${fieldText} top-[2472px] h-[38px] px-[14px]`} />

      <p className={fieldLabel} style={{ top: 2533 }}>Konfirmasi Kehadiran</p>
      {ATTENDANCE.map((opt) => (
        <label key={opt.value} className={`${fieldBox} h-[38px] cursor-pointer`} style={{ top: opt.top }}>
          <input
            type="radio"
            name="kehadiran"
            value={opt.value}
            checked={attendance === opt.value}
            onChange={() => setAttendance(opt.value)}
            className="sr-only"
          />
          <span className="absolute left-[9px] top-[8px] size-[19px] rounded-full border-2 border-[#324532]">
            {attendance === opt.value && <span className="absolute left-[3px] top-[3px] size-[9px] rounded-full bg-[#324532]" />}
          </span>
          <span className="-translate-y-1/2 absolute left-[39px] top-[18px] font-['Raleway'] font-medium text-[12px] leading-[20px] tracking-[-0.204px] text-black whitespace-nowrap">
            {opt.label}
          </span>
        </label>
      ))}

      <label htmlFor="nb-pesan" className={fieldLabel} style={{ top: 2696 }}>Pesan/Ucapan</label>
      <textarea
        id="nb-pesan"
        name="pesan"
        placeholder="Tulis doa & ucapan Anda..."
        className={`${fieldBox} ${fieldText} top-[2711px] h-[104px] resize-none px-[14px] pt-[9px]`}
      />

      <button type="submit" className="absolute left-[37px] top-[2824px] h-[38px] w-[302px] cursor-pointer rounded-[10px] bg-[#aba935]">
        <span className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 font-['Raleway'] font-semibold text-[12px] leading-[20px] tracking-[1.2px] text-white whitespace-nowrap">
          KIRIM UCAPAN
        </span>
      </button>
    </form>
  );
}

// ---------- Page ----------

const timelineText = "font-['Raleway'] text-[10px] leading-[12px] text-black";
const timelineTitle = "font-['Raleway'] font-bold text-[12px] text-black";

export default function NotebookContent({ intro }: { intro: IntroState }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [photo, setPhoto] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setScale(el.clientWidth / FRAME_W);
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / FRAME_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const reveals = useScrollReveals({ enabled: ENABLE_ANIMATIONS, frameW: FRAME_W, frameH: FRAME_H, wrapRef, started: intro.revealed });

  return (
    <RevealProvider value={reveals}>
    <div ref={wrapRef} className="relative w-full overflow-hidden bg-[#fefffa]" style={{ aspectRatio: `${FRAME_W} / ${PAGE_H}` }}>
      <div className="absolute left-0 top-0" style={{ width: FRAME_W, height: FRAME_H, zoom: scale }}>
        {/* ===== BG ===== */}
        <div className="absolute left-0 top-0 h-[667px] w-[375px] bg-[#fefffa]" />
        <Img file="grass.webp" x={-48} y={-96} w={471} h={678} />
        <div className="absolute inset-[12.89%_0_83.08%_0]"><img alt="" src={A('drip.svg')} className="absolute block inset-0 max-w-none size-full" /></div>
        <Img file="lake.webp" x={-220} y={1217} w={768} h={511} />
        <div className="absolute inset-[41.61%_0_54.35%_0]"><img alt="" src={A('drip.svg')} className="absolute block inset-0 max-w-none size-full" /></div>
        <div className="absolute left-0 top-[2481px] h-[489px] w-[375px] bg-[#ddedf8]" />
        <div className="absolute inset-[59.25%_0_36.72%_0]"><img alt="" src={A('drip-1.svg')} className="absolute block inset-0 max-w-none size-full" /></div>
        <div className="absolute inset-[73%_0_22.96%_0]"><img alt="" src={A('drip-2.svg')} className="absolute block inset-0 max-w-none size-full" /></div>

        {/* ===== Forests behind the house ===== */}
        <Img file="forest.webp" x={-106} y={1270} w={525} h={249} />
        <Img file="forest.webp" x={-106} y={1270} w={525} h={249} />
        <Img file="forest.webp" x={-45} y={1183} w={423} h={201} />
        <Img file="forest.webp" x={-45} y={1183} w={423} h={201} />

        {/* ===== Envelope letter (first section, rises in from the cover; then the quote and
            the doodle appear on it) ===== */}
        <div className="absolute left-0 top-0 h-[480px] w-[375px]" style={introStyle(intro)}>
          <Img file="letter.webp" x={30.33} y={92} w={313.211} h={376} />
          <Reveal at={0} kind="fade" delay={750}>
            <div className="-translate-y-1/2 absolute font-['La_Belle_Aurore'] text-[13px] leading-[20px] tracking-[-0.221px] text-black whitespace-nowrap" style={{ left: 177, top: 240 }}>
              “I want all of you,
              <br />
              forever, everyday.
              <br />
              You and me...
              <br />
              everyday”
            </div>
            <Centered x={89} y={278} w={184} h={55} className="font-['La_Belle_Aurore'] text-[13px] leading-[20px] tracking-[-0.221px] text-black">
              -The Notebook
            </Centered>
          </Reveal>
          <Reveal at={0} kind="fade" delay={950}>
            <Img file="doodle-couple.webp" x={90} y={173} w={83} h={123} alt="Ilustrasi Noah dan Allie" />
          </Reveal>
        </div>

        {/* ===== Greeting + bride & groom ===== */}
        <Reveal at={600} kind="fadeUp">
          <Centered x={0} y={600} w={374} h={20} className="font-['La_Belle_Aurore'] text-[18px] leading-[20px] tracking-[-0.306px] text-[#324532]">
            Assalamu’alaikum Wr. Wb.
          </Centered>
        </Reveal>
        <Reveal at={627} kind="fadeUp" delay={120}>
          <Centered x={26} y={627} w={324} h={51} className="font-['Raleway'] text-[12px] leading-[18px] tracking-[-0.204px] text-[#324532]">
            Dengan penuh rasa syukur dan kebahagiaan, kami
            <br />
            mengundang Bapak/Ibu/Saudara/i untuk hadir dan
            <br />
            memberikan doa restu pada hari pernikahan kami:
          </Centered>
        </Reveal>
        {[
          { frame: ['inset-[17.9%_8.68%_78.01%_55.2%]', 'inset-[21.93%_23.54%_77.73%_70.23%]', 'inset-[17.53%_23.77%_82.04%_70%]'], photo: 'inset-[17.67%_-17.71%_76.64%_57.93%]', maskPos: '8.484px 20.814px', alt: 'Allie Hamidah', origin: [274.7, 786] as [number, number], tilt: -2, delay: 330 },
          { frame: ['inset-[17.9%_55.08%_78.01%_8.8%]', 'inset-[21.93%_69.94%_77.73%_23.83%]', 'inset-[17.53%_70.17%_82.04%_23.6%]'], photo: 'inset-[17.67%_57.54%_76.64%_-17.33%]', maskPos: '116.706px 20.814px', alt: 'Noah C', origin: [100.7, 786] as [number, number], tilt: 2, delay: 200 },
        ].map((p) => (
          // Each portrait settles into place, Noah's first.
          <Reveal key={p.alt} at={705} kind="settle" origin={p.origin} tilt={p.tilt} delay={p.delay}>
            <div>
              {p.frame.map((inset, i) => (
                <div key={inset} className={`absolute ${inset}`}>
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={A(['oval-frame.svg', 'oval-bow-bottom.svg', 'oval-bow-top.svg'][i])} />
                </div>
              ))}
              <div className={`absolute ${p.photo}`} style={mask('oval-mask.svg', p.maskPos, '97.277px 140.529px')}>
                <img alt={p.alt} className="absolute left-0 top-0 max-w-none size-full" src={A('couple-photos.webp')} />
              </div>
            </div>
          </Reveal>
        ))}
        <Reveal at={881} kind="fadeUp" delay={300}>
          <Centered x={44} y={881} w={113} h={18} className="font-['Yeseva_One'] text-[14px] leading-[18px] tracking-[-0.238px] text-[#324532]">
            Noah C, ST.
          </Centered>
          <Centered x={44} y={902} w={113} h={25} className="font-['Raleway'] text-[10px] leading-[12px] tracking-[-0.17px] text-black">
            Putra dari Bapak Lorem
            <br />
            Ipsum &amp; Ibu Dolor Sit A
          </Centered>
          <Centered x={218} y={881} w={113} h={18} className="font-['Yeseva_One'] text-[14px] leading-[18px] tracking-[-0.238px] text-[#324532]">
            Allie Hamidah
          </Centered>
          <Centered x={218} y={902} w={113} h={25} className="font-['Raleway'] text-[10px] leading-[12px] tracking-[-0.17px] text-black">
            Putri dari Bapak Lorem
            <br />
            Ipsum &amp; Ibu Dolor Sit A
          </Centered>
        </Reveal>

        {/* ===== Akad Nikah ===== */}
        <Reveal at={968} kind="fadeUp">
          <StampCard outer="inset-[24.56%_14.17%_70.62%_14.93%]" inner="inset-[25.04%_18.95%_71.13%_19.6%]" outerFile="akad-stamp.svg" innerFile="akad-inner.svg" />
          <Centered x={0} y={1005} w={376} h={20} className="font-['La_Belle_Aurore'] text-[20px] leading-[20px] tracking-[-0.34px] text-[#324532]">
            Akad Nikah
          </Centered>
          <Centered x={0} y={1028} w={376} h={60} className="font-['Raleway'] text-[15px] leading-[20px] tracking-[-0.255px] text-black">
            {weddingDateIdLong}
            <br />
            10.00 WIB
            <br />
            Masjid Istiqlal Jakarta
          </Centered>
          <LihatLokasi top={1098} color="#aba935" place="Masjid Istiqlal Jakarta" />
        </Reveal>

        {/* ===== Resepsi (card is rotated -87.52° in Figma) ===== */}
        <Reveal at={1168} kind="fadeUp" delay={120}>
          {[
            ['inset-[29.64%_13.11%_65.26%_13.87%]', 'resepsi-stamp.svg', 'h-[hypot(97.0033cqw,5.70429cqh)] w-[hypot(2.99669cqw,-94.2957cqh)]'],
            ['inset-[30.13%_18.1%_65.79%_18.77%]', 'resepsi-inner.svg', 'h-[hypot(97.2496cqw,6.19821cqh)] w-[hypot(2.75041cqw,-93.8018cqh)]'],
          ].map(([inset, file, size]) => (
            <div key={file} className={`absolute flex ${inset} items-center justify-center`} style={{ containerType: 'size' }}>
              <div className={`flex-none rotate-[-87.52deg] ${size}`}>
                <div className="relative size-full">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={A(file)} />
                </div>
              </div>
            </div>
          ))}
          <Centered x={1} y={1210.65} w={375} h={20} className="font-['La_Belle_Aurore'] text-[20px] leading-[20px] tracking-[-0.34px] text-[#324532]">
            Resepsi
          </Centered>
          <Centered x={0} y={1233.65} w={376} h={60} className="font-['Raleway'] text-[15px] leading-[20px] tracking-[-0.255px] text-black">
            {weddingDateIdLong}
            <br />
            10.00 WIB
            <br />
            Hotel Mulia
          </Centered>
          <LihatLokasi top={1303.65} color="#4e769a" place="Hotel Mulia Jakarta" />
        </Reveal>

        {/* ===== House & boat ===== */}
        <Img file="house.webp" x={94} y={1349} w={207} h={132} />
        <Img file="tree.webp" x={-12} y={1256} w={150} h={225} />
        <Img file="tree.webp" x={228} y={1256} w={150} h={225} flip />
        <Img file="duck.webp" x={42} y={1506} w={49} h={33} />
        <Img file="duck.webp" x={8} y={1555} w={68} h={45} />
        <Img file="lamp.webp" x={326} y={952} w={45} h={66} />
        <Img file="lamp.webp" x={6} y={1114} w={45} h={66} />
        <Img file="couple-boat.webp" x={42} y={1436} w={274} h={205} alt="Ilustrasi Noah dan Allie di perahu" />
        <Img file="duck.webp" x={290} y={1573} w={119} h={80} flip />

        {/* ===== Photo collage (each frame and its photo settle into place together) ===== */}
        <Reveal at={1735} kind="settle" origin={[86.3, 1829.8]} tilt={2} delay={150}>
          <div className="absolute inset-[44.03%_59.22%_51.17%_5.24%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('prewed-1-frame.svg')} />
          </div>
          <div className="absolute inset-[44%_63%_51.27%_9.03%]" style={mask('prewed-1-mask.svg', '0.035px 19.113px', '104.073px 153.471px')}>
            <img alt="" className="absolute left-0 top-0 max-w-none size-full" src={A('prewed-1.webp')} />
          </div>
        </Reveal>
        <Reveal at={1733} kind="settle" origin={[206.1, 1780]} tilt={-2} delay={280}>
          <div className="absolute inset-[43.97%_32.39%_53.64%_42.31%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('prewed-2-frame.svg')} />
          </div>
          <div className="absolute inset-[43.87%_35.01%_53.86%_43.61%]" style={mask('prewed-2-mask.svg', '5.051px 16.876px', '74.678px 71.966px')}>
            <img alt="" className="absolute left-0 top-0 max-w-none size-full" src={A('prewed-2.webp')} />
          </div>
        </Reveal>
        <Reveal at={1733} kind="settle" origin={[308.5, 1780.3]} tilt={2} delay={410}>
          <div className="absolute inset-[43.97%_4.99%_53.62%_69.52%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('prewed-3-frame.svg')} />
          </div>
          <div className="absolute inset-[43.47%_2.76%_53.79%_69.53%]" style={mask('prewed-3-mask.svg', '9.934px 32.861px', '75.224px 72.518px')}>
            <img alt="" className="absolute left-0 top-0 max-w-none size-full" src={A('prewed-3.webp')} />
          </div>
        </Reveal>
        <Reveal at={1830} kind="settle" origin={[232.6, 1878.9]} tilt={-2} delay={540}>
          <div className="absolute flex inset-[46.43%_19.41%_51.08%_43.47%] items-center justify-center" style={{ containerType: 'size' }}>
            <div className="flex-none h-[100cqw] rotate-90 w-[100cqh]">
              <div className="relative size-full">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('prewed-4-frame.svg')} />
              </div>
            </div>
          </div>
          <div
            className="absolute h-[76.972px] left-[158.09px] top-[1840.41px] w-[145.29px]"
            style={mask('prewed-4-mask.svg', '18.035px -0.009px', '112.965px 76.605px')}
          >
            <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={A('prewed-4.webp')} />
          </div>
        </Reveal>
        {PREWED.map((p, i) => (
          <button
            key={p.large}
            type="button"
            aria-label={`Perbesar foto pre-wedding ${i + 1}`}
            onClick={() => setPhoto(i)}
            className={`absolute ${p.button} cursor-zoom-in`}
          />
        ))}

        {/* ===== Cerita Kami ===== */}
        <Reveal at={1993} kind="fade" delay={150}>
          <div className="absolute inset-[50.57%_6.99%_40.9%_4.59%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('timeline.svg')} />
          </div>
        </Reveal>
        <Reveal at={1959} kind="fadeUp">
          <Centered x={84} y={1959} w={200} h={20} className="font-['La_Belle_Aurore'] text-[30px] leading-[20px] tracking-[-0.51px] text-[#4e769a]">
            Cerita Kami...
          </Centered>
        </Reveal>
        <Reveal at={2012} kind="fromLeft" delay={120}>
          <div className="-translate-x-full -translate-y-1/2 absolute text-right tracking-[-0.17px] whitespace-nowrap" style={{ left: 157, top: 2046.5 }}>
            <p className={`${timelineTitle} leading-[12px]`}>1 Juni 2018</p>
            <p className={`${timelineText} relative top-[3.5px]`}>
              Berawal dari dikenalkan oleh
              <br />
              teman kantor. Tak disangka,
              <br />
              perkenalan sederhana ini
              <br />
              menjadi awal dari perjalanan
              <br />
              kami.
            </p>
          </div>
        </Reveal>
        <Reveal at={2164} kind="fromLeft" delay={120}>
          <div className="-translate-x-full -translate-y-1/2 absolute text-right tracking-[-0.17px] whitespace-nowrap" style={{ left: 157, top: 2198.5 }}>
            <p className={`${timelineTitle} leading-[12px]`}>19 Desember 2025</p>
            <p className={`${timelineText} relative top-[3.5px]`}>
              Setelah bertahun-tahun
              <br />
              melewati suka dan duka
              <br />
              bersama, kami mengikat janji
              <br />
              untuk melangkah ke tahap
              <br />
              berikutnya.
            </p>
          </div>
        </Reveal>
        <Reveal at={2090} kind="fromRight" delay={200}>
          <div className="-translate-y-1/2 absolute tracking-[-0.119px] whitespace-nowrap" style={{ left: 207, top: 2125 }}>
            <p className={`${timelineTitle} leading-[9px]`}>14 Agustus 2018</p>
            <p className={`${timelineText} relative top-[4px]`}>
              Setelah kurang lebih dua bulan
              <br />
              PDKT, akhirnya kami
              <br />
              memutuskan untuk menjalin
              <br />
              hubungan dan memulai cerita
              <br />
              sebagai pasangan.
            </p>
          </div>
        </Reveal>
        <Reveal at={2241} kind="fromRight" delay={200}>
          <div className="-translate-y-1/2 absolute tracking-[-0.17px] whitespace-nowrap" style={{ left: 207, top: 2275.5 }}>
            <p className={`${timelineTitle} leading-[12px]`}>{weddingDateId}</p>
            <p className={`${timelineText} relative top-[3.5px]`}>
              Hari di mana cerita kami
              <br />
              berlanjut ke babak baru. Bukan
              <br />
              lagi sekadar tentang aku dan
              <br />
              kamu, tapi tentang kita dan
              <br />
              selamanya.
            </p>
          </div>
        </Reveal>
        <Reveal at={1969} kind="pop" origin={[50.1, 1987]} delay={400}>
          <Float box={[34, 1969, 32.2, 36]} delay={600}>
            <Img file="heart-1.svg" x={34} y={1969} w={32.2} h={36} />
          </Float>
        </Reveal>
        <Reveal at={2210} kind="pop" origin={[340.1, 2228]} delay={400}>
          <Img file="heart-1.svg" x={324} y={2210} w={32.2} h={36} />
        </Reveal>
        <Reveal at={2299} kind="pop" origin={[110.1, 2314]} delay={400}>
          <Float box={[96.68, 2299, 26.83, 30]} delay={2000}>
            <Img file="heart-2.svg" x={96.68} y={2299} w={26.83} h={30} />
          </Float>
        </Reveal>
        <Reveal at={2005} kind="pop" origin={[289.3, 2016.5]} delay={500}>
          <Img file="heart-3.svg" x={279} y={2005} w={20.57} h={23} />
        </Reveal>
        <Img file="lamp.webp" x={-3} y={1705} w={56} h={82} />
        <Img file="lamp.webp" x={307} y={1840} w={56} h={82} />

        {/* ===== Konfirmasi Kehadiran ===== */}
        <Reveal at={2416} kind="fadeUp">
          <Rsvp />
        </Reveal>

        {/* ===== Tanda Kasih & Bingkisan Fisik ===== */}
        <Reveal at={2986} kind="fadeUp" delay={120}>
          <Centered x={43} y={2986} w={289} h={61} className="font-['Raleway'] text-[12px] leading-[15px] tracking-[-0.204px] text-black">
            Doa restu Anda adalah karunia yang berarti bagi kami.
            <br />
            Jika ingin memberi tanda kasih, kami dengan senang
            <br />
            hati menerimanya melalui:
          </Centered>
        </Reveal>
        <Img file="forest.webp" x={-137} y={3402} w={677} h={321} />
        <Img file="forest.webp" x={-159} y={3599} w={721} h={342} />

        <Reveal at={3055} kind="fadeUp" delay={150}>
          <StampCard outer="inset-[77.52%_15.24%_17.66%_13.87%]" inner="inset-[78%_20.02%_18.18%_18.53%]" outerFile="card-stamp.svg" innerFile="card-inner.svg" />
          <Centered x={1} y={3099} w={375} h={20} className="font-['Raleway'] font-bold text-[25px] leading-[20px] tracking-[-0.425px] text-[#29567f]">
            Bank BCA
          </Centered>
          <Centered x={0} y={3130} w={375} h={20} className="font-['Open_Sans'] text-[30px] leading-[20px] text-[#29567f]">
            123456789
          </Centered>
          <SalinButton top={3166} label="Salin nomor rekening" text="123456789" />
          <Centered x={138} y={3195} w={100} h={15} className="font-['Raleway'] text-[10px] leading-[15px] tracking-[-0.17px] text-[#29567f]">
            a.n. Noah Cahyono
          </Centered>
        </Reveal>

        <Reveal at={3354} kind="fadeUp" delay={150}>
          {/* Address card: 26px taller than in Figma (Figma's card has no Salin button and no
              room for one), with the text moved up 8px so name, address and button sit evenly. */}
          <StampCard
            outer="left-[52px] top-[3354.2px] w-[265.8px] h-[216px]"
            inner="left-[69.5px] top-[3375.2px] w-[230.6px] h-[171.6px]"
            outerFile="card-stamp.svg"
            innerFile="card-inner.svg"
          />
          <Centered x={0.5} y={3390} w={375} h={20} className="font-['Raleway'] font-bold text-[25px] leading-[20px] tracking-[-0.425px] text-[#29567f]">
            Allie H.
          </Centered>
          <Centered x={88} y={3424} w={200} h={75} className="font-['Raleway'] text-[10px] leading-[15px] tracking-[-0.17px] text-[#29567f]">
            Jl. Anggrek Loka No. 24,
            <br />
            RT 005 / RW 002 Kel. Meruya Utara,
            <br />
            Kec. Kembangan Jakarta Barat,
            <br />
            DKI Jakarta, 11620
            <br />
            No. HP: 0812-3456-7890
          </Centered>
        </Reveal>

        <Reveal at={2970} kind="fadeUp">
          <Centered x={146} y={2970} w={84} h={20} className="font-['La_Belle_Aurore'] text-[18px] leading-[20px] tracking-[-0.306px] text-[#324532]">
            Tanda Kasih
          </Centered>
        </Reveal>
        <Reveal at={3280} kind="fadeUp" delay={120}>
          <Centered x={43} y={3296} w={289} h={61} className="font-['Raleway'] text-[12px] leading-[15px] tracking-[-0.204px] text-black">
            Jika Anda ingin mengirimkan tanda kasih dalam
            <br />
            bentuk bingkisan, silakan kirimkan ke alamat berikut:
          </Centered>
        </Reveal>
        <Reveal at={3280} kind="fadeUp">
          <Centered x={132} y={3280} w={112} h={20} className="font-['La_Belle_Aurore'] text-[18px] leading-[20px] tracking-[-0.306px] text-[#324532]">
            Bingkisan Fisik
          </Centered>
        </Reveal>

        {/* ===== Closing flower arch ===== */}
        <Reveal at={3389} kind="pop" origin={[309.5, 3638]} delay={300}>
          <Img file="lily-1.webp" x={244} y={3389} w={131} h={249.393} />
        </Reveal>
        <Reveal at={3019} kind="pop" origin={[72.9, 3333]} delay={300}>
          <Img file="lily-2.webp" x={0} y={3019} w={145.808} h={314.55} />
        </Reveal>
        <Img file="bushes-flower.webp" x={-9} y={3418} w={256} h={171} />
        <Img file="gapura.webp" x={2} y={3546} w={372} h={391} />
        <Reveal at={3723} kind="fadeUp" delay={150}>
          <Centered x={130} y={3723} w={130} h={40} className="font-['La_Belle_Aurore'] text-[17px] leading-[20px] tracking-[-0.289px] text-white">
            Sampai Jumpa di
            <br />
            Hari Bahagia Kami
          </Centered>
          <Centered x={141} y={3774} w={108} h={20} className="font-['La_Belle_Aurore'] text-[20px] leading-[20px] tracking-[-0.34px] text-white">
            Noah &amp; Allie
          </Centered>
        </Reveal>

        {/* Drawn last so the foliage around the address card can't cover it. */}
        <Reveal at={3354} kind="fadeUp" delay={150}>
          <SalinButton top={3509} label="Salin alamat" text={ADDRESS} />
        </Reveal>

        {/* ===== Made with love by nicemice ===== */}
        <MadeWithLoveFooter
          y={3965}
          bgTop={3937}
          frameH={PAGE_H}
          background="#fefffa"
          edge={
            // Figma's 447.07 × 33.70 box holds the 446.885 × 30.903 scallop, centred.
            <img alt="" src={A('footer-scallop.svg')} className="absolute block max-w-none" style={{ left: -60.85, top: 3931.2, width: 446.885, height: 30.903 }} />
          }
        />
      </div>

      {photo !== null && <Lightbox index={photo} onClose={() => setPhoto(null)} />}
    </div>
    </RevealProvider>
  );
}
