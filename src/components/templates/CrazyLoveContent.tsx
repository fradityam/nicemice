import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { WEDDING_DATE, weddingDateId } from './crazyLoveWeddingDate';
import { MadeWithLoveFooter } from './MadeWithLoveFooter';
import { PhotoLightbox, type LightboxPhoto, type LightboxTheme } from './PhotoLightbox';
import { Float, Reveal, RevealProvider, useScrollReveals } from './scrollReveal';

// Every layer is placed at its position in the Figma "Content" frame (375 × 6051), in
// Figma's layer order, and the whole frame is scaled to the column width.
const FRAME_W = 375;
const FRAME_H = 6051;

const assetUrls = import.meta.glob('../../assets/images/crazylove/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const A = (file: string) => assetUrls[`../../assets/images/crazylove/${file}`];

const CREAM = '#fff4e8';
const BROWN = '#70564b';
const PINK = '#e58f9b';
const BLUE = '#519ac8';
const COCOA = '#594a43';

const AKAD_PLACE = 'Masjid Al-Abror, Jl. Kenanga No. 17';
const RESEPSI_PLACE = 'Gedung Serbaguna ABC, Jl. Cempaka No. 18, Kota Bogor';
const ACCOUNT = '123456789';
const ADDRESS =
  'Ratu Regina, Jl. Anggrek Loka No. 24, RT 005 / RW 002 Kel. Meruya Utara, Kec. Kembangan Jakarta Barat, DKI Jakarta, 11620. No. HP: 0812-3456-7890';

// Placeholder links until the couple's real venues are set.
const mapsUrl = (place: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

/** Cover → content transition (shared with the template). */
export const INTRO = {
  EASE_OUT: 'cubic-bezier(0.33, 1, 0.68, 1)',
  COVER_FADE_MS: 1000,
  COVER_RISE_PX: 16,
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

// ---------- Scroll reveals ----------

/** Subtle one-time reveals on the cover and as sections scroll into view. Set to false to turn them all off. */
export const ENABLE_ANIMATIONS = true;

const fill = 'absolute inset-0 block max-w-none size-full';

/** Image layer at a Figma box. */
function Img({ file, x, y, w, h, alt = '', className = '', style }: { file: string; x: number; y: number; w: number; h: number; alt?: string; className?: string; style?: CSSProperties }) {
  return (
    <img
      alt={alt}
      src={A(file)}
      className={`absolute block max-w-none object-cover ${className}`}
      style={{ left: x, top: y, width: w, height: h, ...style }}
    />
  );
}

/**
 * A rotated (and optionally mirrored) layer: Figma gives its bounding box [x, y, w, h] and
 * its own unrotated size; the layer is centred in the box and turned about its centre.
 */
function Rot({ box, w, h, deg, flip = false, className = '', children }: { box: [number, number, number, number]; w: number; h: number; deg: number; flip?: boolean; className?: string; children: ReactNode }) {
  const [x, y, bw, bh] = box;
  return (
    <div
      className={`absolute ${className}`}
      style={{ left: x + bw / 2 - w / 2, top: y + bh / 2 - h / 2, width: w, height: h, transform: `rotate(${deg}deg)${flip ? ' scaleX(-1)' : ''}` }}
    >
      {children}
    </div>
  );
}

/** A rotated image (sticker, bouquet, illustration). */
function RotImg({ file, box, w, h, deg, flip }: { file: string; box: [number, number, number, number]; w: number; h: number; deg: number; flip?: boolean }) {
  return (
    <Rot box={box} w={w} h={h} deg={deg} flip={flip}>
      <img alt="" src={A(file)} className={`${fill} object-cover`} />
    </Rot>
  );
}

/** A sticker that pops in (scale 0.9 → 1 about its centre) when it scrolls into view. */
function PopImg({ delay, ...img }: { file: string; x: number; y: number; w: number; h: number; delay?: number }) {
  return (
    <Reveal at={img.y} kind="pop" origin={[img.x + img.w / 2, img.y + img.h / 2]} delay={delay}>
      <Img {...img} />
    </Reveal>
  );
}
function PopRot({ delay, ...img }: { file: string; box: [number, number, number, number]; w: number; h: number; deg: number; flip?: boolean; delay?: number }) {
  const [x, y, bw, bh] = img.box;
  return (
    <Reveal at={y} kind="pop" origin={[x + bw / 2, y + bh / 2]} delay={delay}>
      <RotImg {...img} />
    </Reveal>
  );
}

/**
 * A photo clipped by its Figma mask, with the mask group's inner shadow. Four-cornered masks
 * are given as a clip-path polygon in the photo's own (rotated) coordinates, worked out from
 * the mask vector's corners and rotation; rounded and wavy masks use the mask SVG itself.
 */
function Masked({ file, clip, mask, alt = '', shadow = true }: { file: string; clip?: string; mask?: { file: string; pos: [number, number]; size: [number, number] }; alt?: string; shadow?: boolean }) {
  const style: CSSProperties = clip ? { clipPath: clip } : {};
  if (mask) {
    const m = `url("${A(mask.file)}")`;
    const p = `${mask.pos[0]}px ${mask.pos[1]}px`;
    const s = `${mask.size[0]}px ${mask.size[1]}px`;
    Object.assign(style, { maskImage: m, WebkitMaskImage: m, maskPosition: p, WebkitMaskPosition: p, maskSize: s, WebkitMaskSize: s, maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' });
  }
  return (
    <div className="absolute inset-0" style={style}>
      <img alt={alt} src={A(file)} className={`${fill} object-cover`} />
      {shadow && <div className="absolute inset-0 shadow-[inset_1px_1px_2px_0px_rgba(0,0,0,0.25)]" />}
    </div>
  );
}

/** Text centred on a point, like Figma's centre-anchored text boxes. */
function Centered({ cx, cy, className, style, children }: { cx: number; cy: number; className: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div className={`-translate-x-1/2 -translate-y-1/2 absolute text-center whitespace-nowrap ${className}`} style={{ left: cx, top: cy, ...style }}>
      {children}
    </div>
  );
}

/** Text centred horizontally on cx, with its top at y. */
function Top({ cx, y, className, style, children }: { cx: number; y: number; className: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <p className={`-translate-x-1/2 absolute text-center ${className}`} style={{ left: cx, top: y, ...style }}>
      {children}
    </p>
  );
}

const slab = "font-['Josefin_Slab']";
const sans = "font-['Josefin_Sans']";
const pen = "font-['Nanum_Pen_Script'] font-normal";

/** A section title with its two flourishes ("Cerita Kami", "Doa & Ucapan", "Tanda Kasih"). */
function SectionTitle({ y, color, delay, children }: { y: number; color: string; delay?: number; children: ReactNode }) {
  return (
    <Reveal at={y} kind="fadeUp" delay={delay}>
      <Top cx={187.5} y={y} className={`${pen} whitespace-nowrap text-[40px] leading-[normal]`} style={{ color }}>
        {children}
      </Top>
      <Img file="flourish-left.svg" x={42} y={y + 19.028} w={52} h={10} />
      <Img file="flourish-right.svg" x={282} y={y + 19.028} w={52} h={10} />
    </Reveal>
  );
}

function SeeLocation({ y, place }: { y: number; place: string }) {
  return (
    <a
      href={mapsUrl(place)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Lihat lokasi ${place} di Google Maps`}
      className="absolute left-[140px] h-[22.839px] w-[95.161px] rounded-[100px]"
      style={{ top: y, backgroundColor: BLUE }}
    >
      <span className="absolute left-[8.565px] top-[3.806px] size-[14.274px] overflow-clip">
        <span className="absolute inset-[0_14.58%]">
          <img alt="" className={fill} src={A('pin.svg')} />
        </span>
      </span>
      <span className={`${slab} -translate-x-1/2 -translate-y-1/2 absolute left-[55.19px] top-[11.42px] font-medium text-[12px] leading-[20px] tracking-[-0.204px] whitespace-nowrap`} style={{ color: CREAM }}>
        Lihat Lokasi
      </span>
    </a>
  );
}

/** "SALIN" pill on the gift cards (x, y = the pill's top-left). */
function CopyButton({ x, y, label, text }: { x: number; y: number; label: string; text: string }) {
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
      className="absolute h-[22px] w-[64px] cursor-pointer rounded-[20px] border border-solid bg-[#efecec]"
      style={{ left: x, top: y, borderColor: BROWN }}
    >
      {!copied && <img alt="" src={A('copy.svg')} className="absolute block max-w-none" style={{ left: 9, top: 3.3, width: 11, height: 13.413 }} />}
      {/* "DISALIN" is wider than the text slot next to the icon, so it replaces the icon and centres. */}
      <span
        className="-translate-x-1/2 -translate-y-1/2 absolute top-[10.5px] font-['Raleway'] text-[10px] leading-[15px] tracking-[-0.17px] whitespace-nowrap"
        style={{ left: copied ? 31 : 38.5, color: BROWN }}
      >
        {copied ? 'DISALIN' : 'SALIN'}
      </span>
    </button>
  );
}

// ---------- Countdown ----------

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const s = Math.max(0, Math.floor((target.getTime() - now) / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return [String(Math.floor(s / 86400)), pad(Math.floor(s / 3600) % 24), pad(Math.floor(s / 60) % 60), pad(s % 60)];
}

// Each number sits over its label, as in Figma, and each colon midway between two labels, so
// the spacing stays even whatever the digits are.
const COUNTDOWN_X = [82, 155.5, 223, 296.5];
const COLON_X = COUNTDOWN_X.slice(1).map((x, i) => (x + COUNTDOWN_X[i]) / 2);
const COUNTDOWN_LABELS = ['Hari', 'Jam', 'Menit', 'Detik'];

function Countdown() {
  const parts = useCountdown(WEDDING_DATE);
  const number = `${pen} text-[50px] leading-[20px] tracking-[-0.85px]`;
  return (
    <div role="timer" aria-label={`${parts[0]} hari, ${parts[1]} jam, ${parts[2]} menit, ${parts[3]} detik lagi`}>
      <div aria-hidden="true">
        {parts.map((p, i) => (
          <Centered key={i} cx={COUNTDOWN_X[i]} cy={2070} className={number} style={{ color: BLUE }}>
            {p}
          </Centered>
        ))}
        {COLON_X.map((x) => (
          <Centered key={x} cx={x} cy={2070} className={number} style={{ color: BLUE }}>
            :
          </Centered>
        ))}
        {COUNTDOWN_LABELS.map((label, i) => (
          <Centered key={label} cx={COUNTDOWN_X[i]} cy={2095} className={`${pen} text-[20px] leading-[20px] tracking-[-0.34px] text-[#a9c6d8]`}>
            {label}
          </Centered>
        ))}
      </div>
      <Centered cx={187} cy={2119} className={`${slab} font-semibold text-[12px] leading-[20px] tracking-[-0.204px]`} style={{ color: BROWN }}>
        Menghitung Hari Menuju Momen Bahagia Kami
      </Centered>
    </div>
  );
}

// ---------- Photos + gallery ----------

const PHOTOS = ['photo-6', 'photo-1', 'photo-4', 'photo-3', 'photo-10', 'photo-7', 'photo-5'];

// Each photo section is its own gallery: a tap opens it on that photo, and guests swipe
// through the rest of the section. Values are indexes into PHOTOS, in on-screen order.
const GALLERIES = {
  collage: [0, 1, 2],
  grid: [1, 3, 4, 5, 6],
} as const;
type GallerySection = keyof typeof GALLERIES;
const galleryPhotos = (section: GallerySection): LightboxPhoto[] =>
  GALLERIES[section].map((p, i, all) => ({ src: A(`${PHOTOS[p]}-lg.webp`), alt: `Ratu & Radit, foto ${i + 1} dari ${all.length}` }));
const GALLERY_PHOTOS = { collage: galleryPhotos('collage'), grid: galleryPhotos('grid') };
const LIGHTBOX_THEME: LightboxTheme = {
  arrowBg: PINK,
  arrowFg: CREAM,
  counterClass: "font-['Josefin_Sans'] text-[15px] leading-none tracking-[0.14em] text-[#fff4e8]",
  labels: { dialog: 'Foto Ratu & Radit', close: 'Tutup', prev: 'Foto sebelumnya', next: 'Foto berikutnya' },
};

/**
 * One framed photo. The button has no box of its own; its children keep their frame
 * coordinates, so the stacking (and which photo a tap lands on) is exactly Figma's.
 */
function Photo({ label, onOpen, children }: { label: string; onOpen: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onOpen}
      className="absolute left-0 top-0 size-0 cursor-zoom-in outline-none focus-visible:[&_img]:brightness-90"
      // Figma's drop shadow on each polaroid group (frame + photo).
      style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.25))' }}
    >
      {children}
    </button>
  );
}

/** The four small polaroids of the photo grid. */
const GRID = [
  { x: 32, y: 4021.93, photo: { x: 34, y: 3960, w: 148, h: 223, clip: 'polygon(143.98px 196.78px, 4.03px 196.70px, 2.98px 71.45px, 142.93px 71.53px)' } },
  { x: 193, y: 4021.93, photo: { x: 193, y: 3985, w: 146, h: 219, clip: 'polygon(145.98px 171.78px, 6.03px 171.70px, 4.98px 46.45px, 144.93px 46.53px)' } },
  { x: 32, y: 4204, photo: { x: 35, y: 4153, w: 143, h: 214, clip: 'polygon(142.98px 185.85px, 3.03px 185.77px, 1.98px 60.52px, 141.93px 60.60px)' } },
  { x: 193, y: 4204, photo: { x: 201, y: 4201, w: 143, h: 143, clip: 'polygon(137.98px 137.85px, -1.97px 137.77px, -3.02px 12.52px, 136.93px 12.60px)' } },
] as const;

// ---------- RSVP ----------

const ATTENDANCE = [
  { value: 'hadir', label: 'Akan Hadir', top: 4628 },
  { value: 'mungkin', label: 'Mungkin Hadir', top: 4671 },
  { value: 'tidak', label: 'Berhalangan Hadir', top: 4714 },
];
const formText = `${slab} font-semibold text-[16px] leading-[20px] tracking-[-0.272px]`;
const fieldLabel = `${formText} -translate-y-1/2 absolute left-[44px] whitespace-nowrap`;
const fieldBox = 'absolute left-[37px] w-[302px] rounded-[10px] border border-solid border-[#b98e88] bg-white';

function Rsvp() {
  const [attendance, setAttendance] = useState('hadir');
  return (
    <form onSubmit={(e) => e.preventDefault()} style={{ color: BROWN }}>
      <label htmlFor="cl-name" className={fieldLabel} style={{ top: 4537 }}>Nama</label>
      <input
        id="cl-name"
        name="name"
        placeholder="Nama Anda"
        className={`${fieldBox} ${formText} top-[4552px] h-[38px] px-[14px] outline-none placeholder:text-[rgba(0,0,0,0.2)]`}
      />

      <p className={fieldLabel} style={{ top: 4613 }}>Konfirmasi Kehadiran</p>
      {ATTENDANCE.map((opt) => (
        <label key={opt.value} className={`${fieldBox} h-[38px] cursor-pointer`} style={{ top: opt.top }}>
          <input
            type="radio"
            name="attendance"
            value={opt.value}
            checked={attendance === opt.value}
            onChange={() => setAttendance(opt.value)}
            className="peer sr-only"
          />
          <span className="absolute left-[10px] top-[9px] size-[19px] rounded-full border-2 border-[#324532] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#324532]">
            {attendance === opt.value && <span className="absolute left-[3px] top-[3px] size-[9px] rounded-full bg-[#324532]" />}
          </span>
          <span className={`${formText} -translate-y-1/2 absolute left-[39px] top-[18px] whitespace-nowrap`}>{opt.label}</span>
        </label>
      ))}

      <label htmlFor="cl-message" className={fieldLabel} style={{ top: 4776 }}>Pesan/Ucapan</label>
      <textarea
        id="cl-message"
        name="message"
        placeholder="Tulis doa & ucapan Anda..."
        className={`${fieldBox} ${formText} top-[4791px] h-[104px] resize-none px-[14px] pt-[8px] outline-none placeholder:text-[rgba(0,0,0,0.2)]`}
      />

      <button type="submit" className="absolute left-[37px] top-[4904px] h-[38px] w-[302px] cursor-pointer rounded-[10px]" style={{ backgroundColor: PINK }}>
        <span className={`${slab} -translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 font-bold text-[20px] leading-[20px] tracking-[2px] whitespace-nowrap`} style={{ color: CREAM }}>
          KIRIM UCAPAN
        </span>
      </button>
    </form>
  );
}

// ---------- Page ----------

const storyTitle = `${slab} font-bold text-[15px] leading-[16px]`;
const storyText = `${slab} font-semibold text-[13px]`;

function StoryEntry({ x, cy, right, date, lh, children }: { x: number; cy: number; right?: boolean; date: string; lh: number; children: ReactNode }) {
  return (
    <div
      className={`-translate-y-1/2 absolute flex h-[108px] w-[148px] flex-col justify-center tracking-[-0.221px] ${right ? 'text-right' : ''}`}
      style={{ left: x, top: cy, color: BROWN }}
    >
      <p className={storyTitle}>{date}</p>
      <p className={storyText} style={{ lineHeight: `${lh}px` }}>{children}</p>
    </div>
  );
}

export default function CrazyLoveContent({ intro }: { intro: IntroState }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [gallery, setGallery] = useState<{ section: GallerySection; start: number } | null>(null);
  const openPhoto = (section: GallerySection, start: number) => ({
    label: `Perbesar foto ${start + 1} dari ${GALLERIES[section].length}`,
    onOpen: () => setGallery({ section, start }),
  });
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
    <div ref={wrapRef} className="relative w-full overflow-hidden" style={{ aspectRatio: `${FRAME_W} / ${FRAME_H}`, backgroundColor: CREAM }}>
      <div className="absolute left-0 top-0 overflow-hidden" style={{ width: FRAME_W, height: FRAME_H, zoom: scale }}>
        {/* ===== BG ===== */}
        <div className="absolute left-px top-[798px] h-[1349px] w-[375px]" style={{ backgroundImage: `linear-gradient(to bottom, ${CREAM}, #ffdde1 50%, ${CREAM})` }} />
        <Img file="curtain.webp" x={1} y={604} w={376} h={197} className="rounded-t-[40px]" />
        <Img file="sky.webp" x={0} y={2147} w={375} h={666} />
        <Img file="paper.webp" x={1} y={3743} w={378} h={674} className="opacity-40" />
        <div className="absolute left-[2px] top-[4411px] h-[582px] w-[377px] overflow-hidden opacity-40">
          <img alt="" src={A('paper.webp')} className="absolute left-[-0.06%] top-[-11.76%] block h-[115.2%] w-[100.11%] max-w-none" />
        </div>
        <Img file="ending-bg.webp" x={0} y={5635} w={378} h={335} />
        <div className="absolute left-[-3px] top-[5633px] h-[328px] w-[381px]" style={{ backgroundImage: `linear-gradient(to bottom, ${CREAM}, rgba(255,244,232,0))` }} />

        <Img file="ending-drawing.webp" x={-3} y={5717} w={378} h={252} alt="Ratu memberi Radit buket bunga" />

        {/* ===== Closing ===== */}
        <Reveal at={5640} kind="fadeUp">
          <Top cx={188.5} y={5640} className={`${slab} whitespace-nowrap font-medium text-[17px] leading-[22px]`} style={{ color: BROWN }}>
            Sampai Jumpa di Hari Bahagia Kami
          </Top>
        </Reveal>
        <Reveal at={5640} kind="fadeUp" delay={150}>
          <Top cx={187.5} y={5667} className={`${pen} whitespace-pre text-[30px] leading-[22px]`} style={{ color: BLUE }}>
            {'Ratu    Radit'}
          </Top>
          <Img file="ending-heart.svg" x={175} y={5669} w={18} h={17} />
        </Reveal>

        {/* ===== Tanda Kasih ===== */}
        <Reveal at={5062} kind="fadeUp" delay={120}>
          <Top cx={188.5} y={5062} className={`${slab} w-[315px] font-medium text-[13px] leading-[15px]`} style={{ color: BROWN }}>
            Doa restu Anda adalah karunia yang berarti bagi kami. Jika ingin memberi tanda kasih, kami dengan senang hati menerimanya melalui:
          </Top>
        </Reveal>
        <Reveal at={5117} kind="fadeUp" delay={240}>
          <Img file="gift-card.svg" x={47} y={5117} w={291.896} h={235.682} />
          <div style={{ color: BROWN }}>
            <Centered cx={192.83} cy={5189} className={`${sans} text-[25px] leading-[20px] tracking-[-0.425px]`}>Bank BCA</Centered>
            <Centered cx={191.83} cy={5229.32} className={`${sans} text-[35px] leading-[20px]`}>{ACCOUNT}</Centered>
            <Centered cx={193.33} cy={5294.82} className={`${sans} font-light text-[16px] leading-[15px] tracking-[-0.272px]`}>a.n. Raditya M Fadil</Centered>
          </div>
          <CopyButton x={160.83} y={5251.32} label="Salin nomor rekening" text={ACCOUNT} />
        </Reveal>

        <Reveal at={5371} kind="fadeUp" delay={120}>
          <Img file="gift-card.svg" x={43} y={5371} w={291.896} h={235.682} />
          <div style={{ color: BROWN }}>
            <Centered cx={189.33} cy={5433} className={`${sans} text-[25px] leading-[20px] tracking-[-0.425px]`}>Ratu Regina</Centered>
            <Centered cx={188.83} cy={5490.18} className={`${sans} text-[12px] leading-[15px] tracking-[-0.204px]`}>
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
          </div>
          <CopyButton x={156.83} y={5542.68} label="Salin alamat" text={ADDRESS} />
        </Reveal>

        <PopRot file="sticker-8.webp" box={[306, 5139, 33.075, 39.471]} w={26.697} h={34.874} deg={11.42} delay={400} />
        <PopImg file="sticker-38.webp" x={128} y={5349} w={30} h={29} delay={250} />
        <PopImg file="sticker-35.webp" x={289} y={5559} w={26} h={26} delay={350} />
        <PopRot file="sticker-21.webp" box={[41, 5287, 30.446, 29.851]} w={24} h={23} deg={-20.12} delay={400} />
        <PopImg file="sticker-29.webp" x={9} y={5458} w={32} h={36} delay={300} />
        <PopRot file="sticker-2.webp" box={[335, 5407, 31.402, 31.141]} w={23} h={22} deg={34.35} delay={400} />

        <SectionTitle y={5012} color={PINK}>Tanda Kasih</SectionTitle>

        {/* ===== Doa & Ucapan ===== */}
        <Reveal at={4527} kind="fadeUp" delay={240}>
          <Rsvp />
        </Reveal>
        <SectionTitle y={4477} color={BROWN} delay={120}>Doa &amp; Ucapan</SectionTitle>
        <Reveal at={4416} kind="pop" origin={[187.1, 4446.7]}>
          <Float box={[159, 4416, 56.23, 61.367]} delay={600}>
            <Img file="letter.svg" x={159} y={4416} w={56.23} h={61.367} />
          </Float>
        </Reveal>

        {/* ===== Photo grid ===== */}
        <Reveal at={3777.56} kind="settle" origin={[187.5, 3893.6]}>
          <Photo {...openPhoto('grid', 0)}>
            <Rot box={[31.26, 3777.56, 312.435, 232.06]} w={310.524} h={229.468} deg={-0.48}>
              <img alt="" src={A('prewed-frame-wide.svg')} className={fill} />
            </Rot>
            <div className="absolute left-[-20px] top-[3789px] h-[210px] w-[372px]">
              <Masked file="photo-1.webp" clip="polygon(353.17px 176.37px, 63.01px 177.05px, 61.55px 2.65px, 351.71px 1.97px)" />
            </div>
          </Photo>
        </Reveal>
        {GRID.map((g, i) => (
          <Reveal key={i} at={g.y} kind="settle" origin={[g.x + 75.6, g.y + 83]} tilt={i % 2 ? -3 : 3} delay={150 + (i % 2) * 130}>
            <Photo {...openPhoto('grid', i + 1)}>
              <Rot box={[g.x, g.y, 151.139, 166.041]} w={149.764} h={164.792} deg={-0.48}>
                <img alt="" src={A('prewed-frame.svg')} className={fill} />
              </Rot>
              <div className="absolute" style={{ left: g.photo.x, top: g.photo.y, width: g.photo.w, height: g.photo.h }}>
                <Masked file={`${PHOTOS[i + 3]}.webp`} clip={g.photo.clip} />
              </div>
            </Photo>
          </Reveal>
        ))}
        <PopImg file="bouquet-1.webp" x={276} y={3879} w={104} h={156} delay={300} />
        <PopRot file="bouquet-2.webp" box={[-26, 4119, 115.448, 138.244]} w={79} h={118} deg={-20.59} delay={450} />

        {/* ===== Cerita Kami ===== */}
        <Reveal at={3174} kind="fade" delay={300}>
          <RotImg file="heart-arrow.svg" box={[224, 3174, 64.601, 50.196]} w={62.054} h={21.86} deg={30.32} />
        </Reveal>
        <Reveal at={3508} kind="fade" delay={300}>
          <RotImg file="heart-arrow.svg" box={[224, 3508, 64.601, 50.196]} w={62.054} h={21.86} deg={30.32} />
        </Reveal>
        <Reveal at={3341} kind="fade" delay={300}>
          <RotImg file="heart-arrow.svg" box={[87, 3341, 64.601, 50.196]} w={62.054} h={21.86} deg={-30.32} flip />
        </Reveal>
        {/* Each card is its scallop and its text, from alternating sides. (The cards don't overlap,
            so grouping them changes nothing in the stacking.) */}
        <Reveal at={3052.8} kind="fromLeft" delay={120}>
          <RotImg file="scallop-frame.webp" box={[23, 3052.8, 199, 163]} w={163} h={199} deg={-90} />
          <StoryEntry x={45} cy={3134} right date="1 Juni 2018" lh={16}>
            Berawal dari dikenalkan oleh teman kantor. Tak disangka, perkenalan sederhana ini menjadi awal dari perjalanan kami.
          </StoryEntry>
        </Reveal>
        <Reveal at={3224} kind="fromRight" delay={120}>
          <RotImg file="scallop-frame.webp" box={[153.23, 3224, 199, 163]} w={163} h={199} deg={-90} />
          <StoryEntry x={182} cy={3306} date="14 Agustus 2018" lh={15}>
            Setelah kurang lebih dua bulan PDKT, akhirnya kami memutuskan untuk menjalin hubungan dan memulai cerita sebagai pasangan.
          </StoryEntry>
        </Reveal>
        <Reveal at={3387} kind="fromLeft" delay={120}>
          <RotImg file="scallop-frame.webp" box={[23, 3387, 199, 163]} w={163} h={199} deg={-90} />
          <StoryEntry x={45} cy={3469} right date="19 Desember 2025" lh={16}>
            Setelah bertahun-tahun melewati suka dan duka bersama, kami mengikat janji untuk melangkah ke tahap berikutnya.
          </StoryEntry>
        </Reveal>
        <Reveal at={3558.2} kind="fromRight" delay={120}>
          <RotImg file="scallop-frame.webp" box={[153.23, 3558.2, 199, 163]} w={163} h={199} deg={-90} />
          <StoryEntry x={182} cy={3641} date={weddingDateId} lh={16}>
            Hari di mana cerita kami berlanjut ke babak baru. Bukan lagi sekadar tentang aku dan kamu, tapi tentang kita dan selamanya.
          </StoryEntry>
        </Reveal>

        <PopRot file="sticker-7.webp" box={[230, 3087, 31.335, 34.664]} w={23.696} h={28.826} deg={-17.69} delay={400} />
        <PopImg file="sticker-9.webp" x={75} y={3265} w={23} h={25} delay={400} />
        <PopImg file="sticker-22.webp" x={198} y={3403} w={26} h={30} delay={400} />
        <PopImg file="sticker-30.webp" x={137} y={3624} w={32} h={34} delay={400} />
        <PopImg file="sticker-25.webp" x={23} y={3049} w={26} h={31} delay={300} />
        <PopRot file="sticker-37.webp" box={[330, 3334, 28.397, 33.186]} w={19} h={28} deg={22.9} delay={400} />

        <SectionTitle y={2995} color={PINK}>Cerita Kami</SectionTitle>

        {/* ===== Journal book: Lokasi Acara & Dresscode ===== */}
        <Reveal at={2133} kind="fadeUp">
          <Img file="book.webp" x={27} y={2133} w={320} h={524} />
        </Reveal>
        <PopImg file="sticker-29.webp" x={38} y={2404} w={24} h={27} delay={400} />
        <PopRot file="sticker-heart.webp" box={[296, 2186, 31.748, 31.425]} w={23.425} h={21.598} deg={37.82} delay={400} />
        <PopRot file="sticker-37.webp" box={[282.67, 2204.49, 19.658, 24.018]} w={15} h={21} deg={-14.08} delay={500} />

        <Img file="trees.webp" x={-55} y={2463} w={234} h={379} />
        <Img file="trees.webp" x={197} y={2463} w={234} h={379} style={{ transform: 'scaleX(-1)' }} />

        <Reveal at={2213} kind="fadeUp" delay={150}>
          <Top cx={187.5} y={2213} className={`${slab} whitespace-nowrap font-bold text-[20px] leading-[normal]`} style={{ color: BLUE }}>
            Lokasi Acara
          </Top>
          <div className={`${slab} absolute left-[217px] top-[2268px] w-[111px] font-bold`} style={{ color: BROWN }}>
            <p className="text-[13px] leading-[18px]">Gedung</p>
            <p className="text-[13px] leading-[18px]">Serbaguna ABC</p>
            <p className="font-medium text-[11px] leading-[18px]">Jl. Cempaka No. 18</p>
            <p className="font-medium text-[11px] leading-[18px]">Kota Bogor, Jawa Barat</p>
          </div>
          <a
            href={mapsUrl(RESEPSI_PLACE)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buka lokasi acara di Google Maps"
            className="absolute left-[46px] top-[2241px] h-[127px] w-[159px] overflow-hidden rounded-[20px]"
          >
            <img alt="Peta lokasi Gedung Serbaguna ABC" src={A('map.webp')} className={`${fill} object-cover`} />
          </a>
        </Reveal>

        <Reveal at={2408} kind="fadeUp" delay={150}>
          <Top cx={107} y={2447} className={`${slab} whitespace-nowrap font-bold text-[20px] leading-[normal]`} style={{ color: BLUE }}>
            Dresscode
          </Top>
          <div className={`${slab} absolute left-[67px] top-[2473px] whitespace-nowrap font-medium text-[13px] leading-[16px] text-black`}>
            <p>Tamu diharapkan</p>
            <p>mengenakan</p>
            <p>kebaya dan batik</p>
          </div>
          <Img file="dresscode.webp" x={194} y={2408} w={106} h={159} alt="Pasangan berkebaya dan berbatik" />
        </Reveal>

        <Img file="bridge-scene.webp" x={-13} y={2607} w={401} h={348} alt="Ratu dan Radit duduk di jembatan kayu" />
        <Img file="bridge.webp" x={-37} y={2690} w={432} h={288} />

        {/* ===== Detail Acara ===== */}
        <Reveal at={1489} kind="fadeUp">
          <Img file="ribbon-frame.svg" x={9} y={1489} w={356.787} h={535} />
          <div style={{ color: BROWN }}>
            <Top cx={187.5} y={1601} className={`${slab} whitespace-nowrap font-medium text-[13px] leading-[normal]`}>Acara akan dilaksanakan pada:</Top>
            <Top cx={187.5} y={1623} className={`${slab} whitespace-nowrap font-bold text-[26px] leading-[normal]`}>{weddingDateId}</Top>
          </div>
          <Top cx={188} y={1688} className={`${slab} whitespace-nowrap font-bold text-[18px] leading-[normal]`} style={{ color: BLUE }}>Akad Nikah</Top>
          <Top cx={188.5} y={1715} className={`${slab} whitespace-nowrap font-medium text-[14px] leading-[normal]`} style={{ color: BROWN }}>08.00 - selesai</Top>
          <Top cx={187.5} y={1737} className={`${slab} w-[257px] font-medium text-[14px] leading-[normal]`} style={{ color: BROWN }}>{AKAD_PLACE}</Top>
          <SeeLocation y={1760} place={AKAD_PLACE} />
          <Top cx={188} y={1822} className={`${slab} whitespace-nowrap font-bold text-[18px] leading-[normal]`} style={{ color: BLUE }}>Resepsi</Top>
          <Top cx={187.5} y={1849} className={`${slab} whitespace-nowrap font-medium text-[14px] leading-[normal]`} style={{ color: BROWN }}>11.00 - 14.00</Top>
          <Top cx={187.5} y={1871} className={`${slab} w-[205px] font-medium text-[14px] leading-[17px]`} style={{ color: BROWN }}>Gedung Serbaguna ABC, Jl. Cempaka No. 18</Top>
          <SeeLocation y={1913} place={RESEPSI_PLACE} />
          <Img file="separator.svg" x={154} y={1800} w={67} h={11} />
          <Img file="separator.svg" x={154} y={1666} w={67} h={11} />
        </Reveal>
        <PopRot file="kids.webp" box={[241, 1912, 123.71, 114.228]} w={123.18} h={113.654} deg={-0.27} delay={200} />

        <Countdown />

        {/* ===== Bride ===== */}
        <Reveal at={1231} kind="fadeUp">
          <Img file="bride-frame-outer.svg" x={92} y={1231} w={191.436} h={179.45} />
          <Img file="bride-frame-inner.svg" x={99} y={1237.79} w={177.851} h={165.865} />
          <div className="absolute left-[92px] top-[1231px] size-[185px]">
            <Masked file="bride.webp" mask={{ file: 'wavy-mask.svg', pos: [9, 9], size: [172.637, 160.646] }} alt="Ratu Regina" shadow={false} />
          </div>
        </Reveal>
        <Reveal at={1421} kind="fadeUp" delay={120}>
          <div style={{ color: COCOA }}>
            <Top cx={188.5} y={1421} className={`${slab} whitespace-nowrap font-bold text-[20px] leading-[normal]`}>Ratu Regina</Top>
            <Top cx={187.5} y={1444} className={`${slab} whitespace-nowrap font-medium text-[10px] leading-[normal]`}>Putri dari Bapak Harry Tuna dan Ibu Liliana Teratai</Top>
          </div>
        </Reveal>
        <Reveal at={1239.9} kind="pop" origin={[321.1, 1287.3]} delay={240}>
          <Rot box={[282, 1239.9, 78.27, 94.794]} w={59.637} h={82.574} deg={14.37} flip>
            <img alt="" src={A('heels.svg')} className={fill} />
          </Rot>
        </Reveal>
        <PopRot file="bouquet-2.webp" box={[21, 1252, 155.907, 178.728]} w={100} h={150} deg={-26.17} delay={360} />

        <Reveal at={1173.36} kind="pop" origin={[184.5, 1194]}>
          <Float box={[161.72, 1173.36, 45.554, 41.288]}>
            <RotImg file="heart.webp" box={[161.72, 1173.36, 45.554, 41.288]} w={41} h={36} deg={7.89} />
          </Float>
        </Reveal>

        {/* ===== Groom ===== */}
        <Reveal at={940} kind="fadeUp">
          <Img file="groom-frame-outer.svg" x={92} y={940} w={191.436} h={179.45} />
          <Img file="groom-frame-inner.svg" x={99} y={946.79} w={177.851} h={165.865} />
          <div className="absolute left-[99px] top-[947px] size-[178px]">
            <Masked file="groom.webp" mask={{ file: 'wavy-mask.svg', pos: [2, 2], size: [172.637, 160.646] }} alt="Raditya M Fadil" shadow={false} />
          </div>
        </Reveal>
        <Reveal at={1130} kind="fadeUp" delay={120}>
          <div style={{ color: COCOA }}>
            <Top cx={188.5} y={1130} className={`${slab} whitespace-nowrap font-bold text-[20px] leading-[normal]`}>Raditya M Fadil</Top>
            <Top cx={188} y={1153} className={`${slab} whitespace-nowrap font-medium text-[10px] leading-[normal]`}>Putra dari Bapak Niskala Saputra dan Ibu Dian Santri</Top>
          </div>
        </Reveal>
        <PopImg file="tie.svg" x={52} y={949} w={42.187} h={86} delay={240} />
        <PopRot file="bouquet-2.webp" box={[226, 970, 127.882, 166.917]} w={100} h={150} deg={11.49} delay={360} />

        {/* ===== Bismillah + greeting ===== */}
        <Reveal at={882} kind="fadeUp" delay={130}>
          <Top cx={187.5} y={882} className={`${slab} w-[273px] text-[12px] leading-[15px] text-black`}>
            Dengan penuh rasa syukur dan kebahagiaan, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada hari pernikahan kami:
          </Top>
        </Reveal>
        <Reveal at={825} kind="fadeUp">
          <Img file="bismillah.svg" x={116} y={825} w={144} h={49} alt="Bismillahirrahmanirrahim" />
        </Reveal>

        {/* ===== Theatre curtain ===== */}
        <Img file="curtain-drawing.webp" x={70} y={652} w={231} h={154} alt="Gambar putri tidur di panggung teater" />
        <Img file="paper-rip.svg" x={-13.99} y={783} w={402.887} h={37.13} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }} />

        {/* ===== Polaroid collage + quote (first section, rises in from the cover; then the
            polaroids settle and the stickers are pressed on, one after another) ===== */}
        <div className="absolute left-0 top-0 h-[600px] w-[375px]" style={introStyle(intro)}>
          <RotImg file="scallop-frame.webp" box={[17, 73, 341.747, 407.257]} w={319.416} h={389.147} deg={-3.37} />
          <Rot box={[315, 545.1, 37.196, 46.167]} w={32.754} h={42.878} deg={6.2} flip>
            <img alt="" src={A('bow-small.svg')} className={fill} />
          </Rot>

          <div style={{ color: BLUE }}>
            <Top cx={188} y={511} className={`${pen} whitespace-nowrap text-[22px] leading-[normal]`}>
              He is the one who made me
              <br />
              know a little thing called love.
            </Top>
          </div>
          <Top cx={187.5} y={567} className={`${pen} whitespace-nowrap text-[13px] leading-[normal]`} style={{ color: BROWN }}>
            Nam — Crazy Little Thing Called Love
          </Top>
          <Img file="bow-quote.svg" x={42} y={486} w={74.888} h={69.998} />

          <Reveal at={0} kind="settle" origin={[162, 131.6]} delay={250}>
            <Photo {...openPhoto('collage', 0)}>
              <Rot box={[51.21, 44, 221.705, 175.277]} w={204.634} h={151.218} deg={-7.08}>
                <img alt="" src={A('top-frame.svg')} className={fill} />
              </Rot>
              <Rot box={[54.58, 35.68, 214.722, 195.694]} w={194.893} h={173.001} deg={-7.08}>
                <Masked file="photo-6.webp" clip="polygon(193.41px 132.75px, 2.19px 131.60px, 2.19px 16.66px, 193.41px 17.81px)" />
              </Rot>
            </Photo>
          </Reveal>
          <Reveal at={0} kind="settle" origin={[237.9, 262.2]} tilt={-3} delay={380}>
            <Photo {...openPhoto('collage', 1)}>
              <Rot box={[128, 176, 219.751, 172.406]} w={204.634} h={151.218} deg={6.19}>
                <img alt="" src={A('top-frame.svg')} className={fill} />
              </Rot>
              <Rot box={[78, 176, 281.358, 178.294]} w={266.492} h={149.902} deg={6.31}>
                <Masked file="photo-1.webp" clip="polygon(247.70px 117.82px, 56.49px 117.07px, 56.25px 2.14px, 247.46px 2.89px)" />
              </Rot>
            </Photo>
          </Reveal>
          <Reveal at={0} kind="settle" origin={[127.8, 376.6]} delay={510}>
            <Photo {...openPhoto('collage', 2)}>
              <Rot box={[22.67, 297.11, 210.355, 159.055]} w={204.634} h={151.218} deg={-2.23}>
                <img alt="" src={A('top-frame.svg')} className={fill} />
              </Rot>
              <Rot box={[13, 297, 231.761, 135.77]} w={228} h={129} deg={-1.72}>
                <Masked file="photo-4.webp" clip="polygon(208.65px 123.46px, 17.44px 124.02px, 16.42px 9.09px, 207.63px 8.54px)" />
              </Rot>
            </Photo>
          </Reveal>

          <PopRot file="heart.webp" box={[248, 365, 31.455, 29.763]} w={25.575} h={22.923} deg={18.2} delay={1450} />
          <PopImg file="sticker-3.webp" x={45} y={418} w={26} h={29} delay={1650} />
          <PopImg file="sticker-4.webp" x={254} y={95} w={25} h={25} delay={950} />
          <Reveal at={0} kind="pop" origin={[134.5, 52]} delay={850}>
            <Float box={[118, 34, 33, 36]} delay={1400}>
              <Img file="sticker-9.webp" x={118} y={34} w={33} h={36} />
            </Float>
          </Reveal>
          <PopImg file="sticker-13.webp" x={39} y={120} w={38} h={35} delay={1050} />
          <PopImg file="sticker-14.webp" x={196} y={174} w={20} h={20} delay={1150} />
          <PopRot file="sticker-15.webp" box={[303, 184, 28.753, 28.052]} w={23.084} h={21.994} deg={18.01} delay={1250} />
          <PopImg file="sticker-16.webp" x={17} y={285} w={36} h={41} delay={1350} />
          <PopImg file="sticker-19.webp" x={116} y={235} w={35} h={32} delay={1300} />
          <PopRot file="sticker-37.webp" box={[300.74, 315.76, 49.516, 49.479]} w={29} h={41} deg={45.13} delay={1400} />
          <PopImg file="sticker-43.webp" x={178} y={428} w={34} h={38} delay={1600} />
          <PopImg file="sticker-44.webp" x={218.1} y={399.5} w={21} h={24} delay={1550} />
        </div>

        {/* ===== Made with love by nicemice ===== */}
        <MadeWithLoveFooter
          y={5998}
          bgTop={5970}
          frameH={FRAME_H}
          background={CREAM}
          edge={<Img file="paper-rip.svg" x={-17.99} y={5952} w={402.887} h={37.13} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }} />}
        />
      </div>

      {gallery && <PhotoLightbox photos={GALLERY_PHOTOS[gallery.section]} start={gallery.start} theme={LIGHTBOX_THEME} onClose={() => setGallery(null)} />}
    </div>
    </RevealProvider>
  );
}
