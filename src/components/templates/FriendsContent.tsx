import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { weddingDate } from './friendsWeddingDate';
import { MadeWithLoveFooter } from './MadeWithLoveFooter';
import { Float, Reveal, RevealProvider, useScrollReveals } from './scrollReveal';

// Every layer is placed at its position in the Figma "Content" frame (375 × 5768), in
// Figma's layer order, and the whole frame is scaled to the column width.
const FRAME_W = 375;
const FRAME_H = 5768;

const assetUrls = import.meta.glob('../../assets/images/friends/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const A = (file: string) => assetUrls[`../../assets/images/friends/${file}`];

/** Subtle one-time reveals on the cover and as sections scroll into view. Set to false to turn them all off. */
export const ENABLE_ANIMATIONS = true;

const PURPLE = '#a07eb9';
const VENUE = 'Grant House, Jawa Barat';
const ADDRESS =
  'Ratu R, Jl. Anggrek Loka No. 24, RT 005 / RW 002 Kel. Meruya Utara, Kec. Kembangan Jakarta Barat, DKI Jakarta, 11620. Phone: 0812-3456-7890';
// Figma's #fbda43 → rgba(255,252,238,0) gradient, interpolated non-premultiplied like Figma (a
// plain CSS gradient keeps the yellow saturated all the way down to transparent).
const yellowGradient = `linear-gradient(to bottom, ${Array.from({ length: 11 }, (_, i) => {
  const t = i / 10;
  const c = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgba(${c(251, 255)},${c(218, 252)},${c(67, 238)},${(1 - t).toFixed(2)}) ${t * 100}%`;
}).join(', ')})`;

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

/** A layer with Figma's absolute transform [[a, b, x], [c, d, y]] (rotation and/or flip). */
function Transformed({ m, w, h, className = '', style, children }: { m: [number, number, number, number, number, number]; w: number; h: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  const [a, b, x, c, d, y] = m;
  return (
    <div
      className={`absolute left-0 top-0 ${className}`}
      style={{ width: w, height: h, transformOrigin: '0 0', transform: `matrix(${a}, ${c}, ${b}, ${d}, ${x}, ${y})`, ...style }}
    >
      {children}
    </div>
  );
}
const fill = 'absolute inset-0 block max-w-none size-full';

/** Text centred on a point, like Figma's centre-anchored text boxes. */
function Centered({ cx, cy, className, style, children }: { cx: number; cy: number; className: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div className={`-translate-x-1/2 -translate-y-1/2 absolute text-center whitespace-nowrap ${className}`} style={{ left: cx, top: cy, ...style }}>
      {children}
    </div>
  );
}

const friendsTitle = 'ff-friends tracking-[-0.017em] whitespace-nowrap';

function SeeLocation({ place }: { place: string }) {
  return (
    <a
      href={mapsUrl(place)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`See ${place} on Google Maps`}
      className="absolute left-[138px] top-[3609px] h-[24px] w-[100px] rounded-[100px] bg-[#fbda43]"
    >
      <span className="absolute left-[9px] top-[4px] size-[15px] overflow-clip">
        <span className="absolute inset-[0_14.58%]">
          <img alt="" className={fill} src={A('pin.svg')} />
        </span>
      </span>
      <span className="ff-f72 -translate-x-1/2 -translate-y-1/2 absolute left-[58px] top-[12px] text-[12px] leading-[20px] tracking-[-0.017em] text-[#181719] whitespace-nowrap">
        See Location
      </span>
    </a>
  );
}

/** The bank cup's "COPY" pill, at its Figma position (x, y = the pill's top-left). */
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
      className="absolute h-[22px] w-[64px] cursor-pointer rounded-[20px] border border-solid border-[#0b5da9] bg-[#efecec]"
      style={{ left: x, top: y }}
    >
      {!copied && <img alt="" src={A('copy.svg')} className="absolute block max-w-none" style={{ left: 9, top: 3.2, width: 11, height: 13.41 }} />}
      {/* "COPIED" is wider than the text slot next to the icon, so it replaces the icon and centres. */}
      <span
        className="-translate-x-1/2 -translate-y-1/2 absolute top-[10.5px] font-['Raleway'] text-[10px] leading-[15px] tracking-[-0.17px] text-[rgba(11,93,169,0.87)] whitespace-nowrap"
        style={{ left: copied ? 31 : 38.5 }}
      >
        {copied ? 'COPIED' : 'COPY'}
      </span>
    </button>
  );
}

// ---------- Polaroids + lightbox ----------

const POLAROIDS = ['polaroid-1-lg.webp', 'polaroid-2-lg.webp', 'polaroid-3-lg.webp'];

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
      aria-label={`Photo ${index + 1}`}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <img alt={`Ratu & Radit, photo ${index + 1}`} src={A(POLAROIDS[index])} className="max-h-[88vh] max-w-full rounded-lg object-contain" />
      <button
        ref={closeRef}
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white"
      >
        ×
      </button>
    </div>
  );
}

/**
 * One polaroid: the white frame and the photo, clipped to Figma's mask rectangle (given in
 * the photo's own rotated coordinates). The button has no
 * box of its own; its children keep their frame coordinates, so the stacking (and which photo
 * a tap lands on) is exactly Figma's.
 */
function Polaroid({ index, onOpen, children }: { index: number; onOpen: (i: number) => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={`Enlarge photo ${index + 1}`}
      onClick={() => onOpen(index)}
      className="group absolute left-0 top-0 size-0 cursor-zoom-in outline-none"
    >
      {children}
    </button>
  );
}
const polaroidPhoto = 'absolute inset-0 block max-w-none size-full object-cover group-focus-visible:outline-2 group-focus-visible:outline-white';

// ---------- RSVP ----------

const ATTENDANCE = [
  { value: 'yes', label: 'I’ll be there', top: 3922 },
  { value: 'no', label: 'Sorry, I can’t make it', top: 3965 },
  { value: 'maybe', label: 'I’m not sure yet', top: 4008 },
];
const fieldLabel = 'ff-f72 -translate-y-1/2 absolute left-[44px] text-[12px] leading-[20px] tracking-[-0.017em] text-black whitespace-nowrap';
const fieldBox = 'absolute left-[37px] w-[302px] rounded-[10px] border border-solid border-[#a07eb9] bg-white';
const fieldText = 'ff-f72 text-[12px] leading-[20px] tracking-[-0.017em] text-black placeholder:text-[rgba(0,0,0,0.2)] outline-none';

function Rsvp() {
  const [attendance, setAttendance] = useState('yes');
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Centered cx={188.5} cy={3800} className={`${friendsTitle} text-[18px] leading-[20px] text-[#a07eb9]`}>
        attendance
      </Centered>

      <label htmlFor="fr-name" className={fieldLabel} style={{ top: 3831 }}>Name</label>
      <input id="fr-name" name="name" placeholder="Your Name" className={`${fieldBox} ${fieldText} top-[3846px] h-[38px] px-[14px]`} />

      <p className={fieldLabel} style={{ top: 3907 }}>Will you be joining us?</p>
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
          <span className="absolute left-[10px] top-[8px] size-[19px] rounded-full border-2 border-[#a07eb9] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#a07eb9]">
            {attendance === opt.value && <span className="absolute left-[3px] top-[3px] size-[9px] rounded-full bg-[#a07eb9]" />}
          </span>
          <span className="ff-f72 -translate-y-1/2 absolute left-[39px] top-[18px] text-[12px] leading-[20px] tracking-[-0.017em] text-black whitespace-nowrap">
            {opt.label}
          </span>
        </label>
      ))}

      <label htmlFor="fr-message" className={fieldLabel} style={{ top: 4070 }}>Message</label>
      <textarea
        id="fr-message"
        name="message"
        placeholder="A Note for Us"
        className={`${fieldBox} ${fieldText} top-[4085px] h-[104px] resize-none px-[14px] pt-[8px]`}
      />

      <button type="submit" className="absolute left-[37px] top-[4198px] h-[38px] w-[302px] cursor-pointer rounded-[10px]" style={{ backgroundColor: PURPLE }}>
        <span className="ff-f72 -translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 font-semibold text-[12px] leading-[20px] tracking-[1.2px] text-white whitespace-nowrap">
          SUBMIT RSVP
        </span>
      </button>
    </form>
  );
}

// ---------- Page ----------

const storyTitle = 'ff-f72 -translate-y-1/2 absolute left-[89px] text-[15px] leading-[30px] tracking-[-0.017em] text-[#d64f16] whitespace-nowrap';
const storyText = 'ff-f72 -translate-y-1/2 absolute left-[89px] w-[218px] text-[11px] leading-[13px] tracking-[-0.017em] text-black';
const eventText = 'ff-f72 text-[17px] leading-[22px] tracking-[-0.017em] text-white';
const eventTitle = 'ff-f72-supersoft text-[22px] leading-[30px] tracking-[-0.017em] text-white';

export default function FriendsContent({ intro }: { intro: IntroState }) {
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
    <div ref={wrapRef} className="relative w-full overflow-hidden bg-[#fefffa]" style={{ aspectRatio: `${FRAME_W} / ${FRAME_H}` }}>
      <div className="absolute left-0 top-0 overflow-hidden" style={{ width: FRAME_W, height: FRAME_H, zoom: scale }}>
        {/* ===== BG ===== */}
        <div className="absolute left-0 top-[459px] h-[1587px] w-[377px]" style={{ backgroundColor: PURPLE }} />
        <Img file="fabric-texture.webp" x={1.01} y={676.8} w={378} h={1408.1} className="opacity-10" />
        <div className="absolute left-0 top-[-236px] h-[851px] w-[375px] overflow-hidden">
          <img alt="" src={A('city-night.webp')} className="absolute left-0 top-0 block h-[109.05%] w-full max-w-none" />
        </div>
        <Img file="grass.webp" x={-113} y={492} w={602} h={243} />
        <div className="absolute left-0 top-[2018px] h-[1059px] w-[376px] bg-[#d64f16]" />
        {[2013, 2347, 2681].flatMap((y) => [0, 188].map((x) => <Img key={`${x}-${y}`} file="brick.webp" x={x} y={y} w={188} h={334} className="opacity-33" />))}
        {[0, 188].map((x) => (
          <div key={x} className="absolute top-[3014px] h-[69px] w-[188px] overflow-hidden opacity-33" style={{ left: x }}>
            <img alt="" src={A('brick.webp')} className="absolute left-0 top-0 block h-[334px] w-full max-w-none object-cover" />
          </div>
        ))}
        <div className="absolute left-0 top-[3106px] h-[2245px] w-[376px]" style={{ backgroundImage: yellowGradient }} />
        <Img file="snowy-venue.webp" x={0} y={5117} w={375} h={561} className="opacity-88" />
        <div className="absolute left-0 top-[5336px] h-[354px] w-[376px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-white to-[80.288%]" />

        {/* ===== Background doodles ===== */}
        <Img file="gift-icons.svg" x={27} y={4723} w={357.567} h={368.557} />
        <Reveal at={887} kind="pop" origin={[57.5, 1012]} delay={300}>
          <Img file="lily-1.webp" x={-12} y={887} w={139} h={250} />
        </Reveal>
        <Reveal at={1341} kind="pop" origin={[316.9, 1467.9]} delay={300}>
          <Transformed m={[0.984, -0.179, 269.661, 0.179, 0.984, 1341]} w={138.373} h={232.678}><img alt="" src={A('lily-2.webp')} className={fill} /></Transformed>
        </Reveal>
        <Reveal at={1561} kind="pop" origin={[52.2, 1632.4]} delay={350}>
          <Transformed m={[-0.881, 0.474, 53.304, 0.474, 0.881, 1561]} w={69.617} h={124.637}><img alt="" src={A('lily-3.webp')} className={fill} /></Transformed>
        </Reveal>
        <Reveal at={1066} kind="pop" origin={[317.2, 1137.4]} delay={350}>
          <Transformed m={[0.881, -0.474, 316.066, 0.474, 0.881, 1066]} w={69.617} h={124.637}><img alt="" src={A('lily-3.webp')} className={fill} /></Transformed>
        </Reveal>
        <Reveal at={3985} kind="pop" origin={[351.9, 4105.6]} delay={300}>
          <Transformed m={[-0.908, 0.419, 364.547, 0.419, 0.908, 3985]} w={123.968} h={208.455}><img alt="" src={A('lily-2.webp')} className={fill} /></Transformed>
        </Reveal>
        <Reveal at={3665} kind="pop" origin={[36.2, 3756.1]} delay={300}>
          <Transformed m={[0.773, -0.634, 50.051, 0.634, 0.773, 3665]} w={94.229} h={158.448}><img alt="" src={A('lily-2.webp')} className={fill} /></Transformed>
        </Reveal>
        <Img file="ribbon.svg" x={-16} y={3735.1} w={377.688} h={440.765} />

        {/* ===== Cast line-art on the yellow arch ===== */}
        <Img file="yellow-arch.svg" x={-16.76} y={1828} w={408.511} h={256} />
        <Img file="carpet.webp" x={-18} y={1966} w={412} h={135} />
        <Img file="cast-lineart.webp" x={29} y={1854} w={325} h={217} alt="Line drawing of the bride and her friends on the couch" />

        <Reveal at={2110} kind="fadeUp">
          <Centered cx={188} cy={2137} className={`${friendsTitle} text-[24px] leading-[30px] text-white`}>
            Could this wedding
            <br />
            <span className="text-[33px]">be</span> any more special?
          </Centered>
        </Reveal>
        <Reveal at={1330} kind="fade" delay={150}>
          <Centered cx={190} cy={1341} className="ff-f72-soft text-[24px] leading-[30px] tracking-[-0.017em] text-white">
            &amp;
          </Centered>
        </Reveal>
        <Reveal at={770} kind="fadeUp">
          <Centered cx={188} cy={798} className={`${friendsTitle} text-[22px] leading-[30px] text-white`}>
            THE ONE WHERE
            <br />
            WE FOUND OUR PERSON
          </Centered>
        </Reveal>

        {/* ===== Fountain scene (first section, rises in from the cover) ===== */}
        <div className="absolute left-0 top-0 h-[780px] w-[375px]" style={introStyle(intro)}>
          <Img file="fountain.webp" x={60} y={334} w={245} h={261} />
          <Img file="lamp.webp" x={264} y={389} w={157} h={236} />
          <Img file="lamp.webp" x={-47} y={389} w={157} h={236} />
          <Img file="orange-couch.webp" x={24} y={472} w={327} h={164} alt="The orange couch in front of the fountain" />
          <h1 className={`-translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-[116.5px] text-center ${friendsTitle} leading-[35px] text-white`}>
            <span className="block text-[20px]">The one with</span>
            <span className="block text-[27px]">Ratu &amp; Radit</span>
            <span className="block text-[27px]">Wedding</span>
          </h1>
          <Centered cx={187.5} cy={185} className={`${friendsTitle} text-[17px] leading-[42px] text-white`}>
            {weddingDate}
          </Centered>

          {/* Magna Doodle */}
          <Img file="magna-doodle.webp" x={81.25} y={515} w={223.5} h={149} />
          <Centered cx={181.24} cy={572.84} className={`${friendsTitle} text-[14px] leading-[19px] text-[#3a3535]`}>
            we can have
            <br />
            any future
            <br />
            you want!
          </Centered>
          <Centered cx={176.8} cy={614.87} className={`${friendsTitle} text-[12px] leading-[26px] text-[#3a3535]`}>
            -Mike
          </Centered>
        </div>

        <Reveal at={835} kind="fadeUp" delay={120}>
          <Centered cx={187.5} cy={845} className="ff-f72 text-[18px] leading-[30px] tracking-[-0.017em] text-white">
            Meet the two behind this love story.
          </Centered>
        </Reveal>

        {/* ===== Groom & bride in the yellow peephole frames ===== */}
        <Reveal at={887} kind="fadeUp" delay={150}>
          <Img file="groom.webp" x={83} y={940} w={239} h={239} alt="Raditya M Fadil" style={{ clipPath: 'inset(3px 33px 12px 10px)' }} />
          <Img file="yellow-frame.webp" x={39} y={887} w={298} h={337} />
        </Reveal>
        <Reveal at={1225} kind="fadeUp" delay={150}>
          <Centered cx={188} cy={1239} className={`${friendsTitle} text-[24px] leading-[30px] text-white`}>Raditya m Fadil</Centered>
          <Centered cx={187} cy={1265} className="ff-f72 text-[16px] leading-[30px] tracking-[-0.017em] text-white">Beloved son of</Centered>
          <Centered cx={187.5} cy={1286} className="ff-f72 text-[16px] leading-[30px] tracking-[-0.017em] text-white">Chandra Bong &amp; Monica Ganjar</Centered>
        </Reveal>

        <Reveal at={1381} kind="fadeUp" delay={150}>
          <Img file="bride.webp" x={70} y={1437} w={240} h={240} alt="Ratu Regina" style={{ clipPath: 'inset(0 21px 16px 23px)' }} />
          <Img file="yellow-frame.webp" x={39} y={1381} w={298} h={337} />
        </Reveal>
        <Reveal at={1720} kind="fadeUp" delay={150}>
          <Centered cx={188} cy={1733} className={`${friendsTitle} text-[24px] leading-[30px] text-white`}>Ratu Regina</Centered>
          <Centered cx={187.5} cy={1759} className="ff-f72 text-[16px] leading-[30px] tracking-[-0.017em] text-white">Beloved daughter of</Centered>
          <Centered cx={187} cy={1780} className="ff-f72 text-[16px] leading-[30px] tracking-[-0.017em] text-white">Joseph Tribuana &amp; Rachel Hijau</Centered>
        </Reveal>

        {/* ===== Stacked polaroids ===== */}
        <Reveal at={2177} kind="settle" origin={[186.7, 2299]} tilt={3} delay={150}>
          <Polaroid index={0} onOpen={setPhoto}>
            <Img file="polaroid-frame-1.svg" x={46.963} y={2202} w={279.501} h={194} />
            <div className="absolute left-[50px] top-[2177px] h-[243px] w-[274px]" style={{ clipPath: 'inset(33.049px 5.507px 32.045px 4.701px)' }}>
              <img alt="" src={A('polaroid-1.webp')} className={polaroidPhoto} />
            </div>
          </Polaroid>
        </Reveal>
        <Reveal at={2177} kind="settle" origin={[207.2, 2298.9]} tilt={-3} delay={300}>
          <Polaroid index={1} onOpen={setPhoto}>
            <Transformed m={[0.995, -0.097, 77.799, 0.097, 0.995, 2189]} w={279} h={193.652}><img alt="" src={A('polaroid-frame-2.svg')} className={fill} /></Transformed>
            <Transformed m={[0.995, -0.097, 79.751, 0.097, 0.995, 2168.984]} w={286.575} h={214.931} style={{ clipPath: 'inset(28.137px 15.535px 9.207px 7.721px)' }}>
              <img alt="" src={A('polaroid-2.webp')} className={polaroidPhoto} />
            </Transformed>
          </Polaroid>
        </Reveal>
        <Reveal at={2177} kind="settle" origin={[171.6, 2303.9]} tilt={3} delay={450}>
          <Polaroid index={2} onOpen={setPhoto}>
            <Transformed m={[0.996, 0.089, 24, -0.089, 0.996, 2219.829]} w={279} h={193.652}><img alt="" src={A('polaroid-frame-3.svg')} className={fill} /></Transformed>
            <Transformed m={[0.996, 0.089, 9.771, -0.089, 0.996, 2229.132]} w={316} h={178} style={{ clipPath: 'inset(0.035px 29.958px 0.378px 22.723px)' }}>
              <img alt="" src={A('polaroid-3.webp')} className={polaroidPhoto} />
            </Transformed>
          </Polaroid>
        </Reveal>

        <Reveal at={1795} kind="pop" origin={[338.1, 1873.3]} delay={600}>
          <Float box={[259.0, 1795.0, 158.4, 156.8]} delay={1200}>
            <Transformed m={[0.7806, 0.625, 259, -0.625, 0.7806, 1868.14]} w={117.02} h={106.94}><img alt="" src={A('turkey.webp')} className={fill} /></Transformed>
          </Float>
        </Reveal>

        {/* ===== Our Love Story on torn paper ===== */}
        <Transformed m={[0.974, 0.225, -62.181, -0.225, 0.974, 2716.135]} w={137.221} h={244.869}><img alt="" src={A('newspaper-1.webp')} className={fill} /></Transformed>
        <Img file="newspaper-2.webp" x={209} y={2481} w={225} h={271} />
        <Img file="torn-paper.webp" x={12} y={2429} w={358} h={567} />
        <Reveal at={2480} kind="fadeUp">
          <Centered cx={187.5} cy={2495} className={`${friendsTitle} text-[24px] leading-[30px] text-[#d64f16]`}>Our Love Story</Centered>
        </Reveal>
        <Reveal at={2544} kind="fade" delay={150}>
          <Img file="timeline-line.svg" x={69.5} y={2549.6} w={3} h={175.6} />
          {[2543.7, 2636.9, 2714.1].map((y) => (
            <Img key={y} file="timeline-bullet.svg" x={62} y={y} w={17} h={17} />
          ))}
        </Reveal>
        <Reveal at={2540} kind="fadeUp" delay={150}>
          <p className={storyTitle} style={{ top: 2553 }}>The One Where They Met</p>
          <p className={storyText} style={{ top: 2593.5 }}>
            It was a rainy Tuesday at a tiny coffee shop that smelled of cinnamon and bad decisions. Ratu knocked over Radit’s americano, and he said it was the best thing that ever happened to him.
          </p>
        </Reveal>
        <Reveal at={2632} kind="fadeUp" delay={150}>
          <p className={storyTitle} style={{ top: 2646 }}>The One With the First Date</p>
          <p className={storyText} style={{ top: 2678.5 }}>
            He took her to a rooftop cinema, forgot the blanket, and she wore his jacket the whole night. She still has it.
          </p>
        </Reveal>
        <Reveal at={2708} kind="fadeUp" delay={150}>
          <p className={storyTitle} style={{ top: 2723 }}>The One With the Proposal</p>
          <p className={storyText} style={{ top: 2763.5 }}>
            Central Perk. Their usual table. He got down on one knee and the barista started slow-clapping. Everyone joined in. It was embarrassingly perfect.
          </p>
        </Reveal>

        {/* ===== Central Perk ===== */}
        <Img file="perk-bar.webp" x={47} y={2808} w={280} h={224} />
        <Img file="carpet.webp" x={-62} y={3039} w={498} h={163} />
        <Img file="lamp.webp" x={257} y={2826} w={167} h={251} />
        <Img file="perk-couch.webp" x={17} y={2925} w={340} h={191} alt="The Central Perk couch" />
        <Img file="perk-table.webp" x={71} y={3002} w={232} h={155} />

        {/* ===== Ceremony & Reception ===== */}
        <Reveal at={3221} kind="fadeUp" delay={150}>
          <div className="absolute left-[37px] top-[3265px] h-[435px] w-[299px]" style={{ backgroundColor: PURPLE }} />
          <Img file="ornate-frame.webp" x={14} y={3221} w={348} h={523} />
          <Centered cx={188} cy={3591} className={eventText}>{VENUE}</Centered>
          <SeeLocation place={VENUE} />

          <Centered cx={188} cy={3353} className={eventTitle}>Ceremony</Centered>
          <Centered cx={188} cy={3379} className={eventText}>{weddingDate}</Centered>
          <Centered cx={188} cy={3405} className={eventText}>10.00 - 11.00 WIB</Centered>
          <Img file="rings.svg" x={166} y={3314.2} w={43.942} h={24} />
          <Img file="wreath.webp" x={238.99} y={3343} w={41.806} h={17.637} />
          <Transformed m={[-1, 0, 134.806, 0, 1, 3343]} w={41.806} h={17.637}><img alt="" src={A('wreath.webp')} className={fill} /></Transformed>

          <Centered cx={188} cy={3518} className={eventText}>{weddingDate}</Centered>
          <Centered cx={188.5} cy={3544} className={eventText}>13.00 - 16.00 WIB</Centered>
          <Centered cx={188} cy={3488} className={eventTitle}>Reception</Centered>
          <Img file="wreath.webp" x={238.99} y={3478.9} w={41.806} h={17.637} />
          <Transformed m={[-1, 0, 135.81, 0, 1, 3478.9]} w={41.806} h={17.637}><img alt="" src={A('wreath.webp')} className={fill} /></Transformed>
          <Img file="cake.webp" x={176} y={3444.3} w={23} h={31.8} />
        </Reveal>

        <Reveal at={3202} kind="pop" origin={[54.2, 3263.6]} delay={400}>
          <Float box={[-13.0, 3202.0, 134.5, 123.4]} delay={600}>
            <Transformed m={[1, -0.023, -10.223, 0.023, 1, 3202]} w={131.543} h={120.213}><img alt="" src={A('turkey.webp')} className={fill} /></Transformed>
          </Float>
        </Reveal>
        <Reveal at={3602} kind="pop" origin={[289, 3687]} delay={400}>
          <Img file="laundry-couple.webp" x={208} y={3602} w={162} h={170} />
        </Reveal>

        {/* ===== Attendance ===== */}
        <Reveal at={3790} kind="fadeUp">
          <Rsvp />
        </Reveal>

        {/* ===== Gifting ===== */}
        <Reveal at={4715} kind="fadeUp" delay={120}>
          <Centered cx={188.5} cy={4729} className="ff-f72-soft text-[12px] leading-[15px] tracking-[-0.017em] text-[#181719]">
            Your prayers and good wishes mean so much to us.
            <br />
            If you’d like to send us a gift, you can do so here:
          </Centered>
        </Reveal>
        <Reveal at={4760} kind="fadeUp" delay={200}>
          <Img file="cup-blue.webp" x={-5} y={4723} w={380} h={253} />
          <Centered cx={213.5} cy={4840} className="ff-fraunces font-bold text-[20px] leading-[20px] tracking-[-0.017em] text-white">Bank BCA</Centered>
          <Centered cx={212.5} cy={4868} className="ff-fraunces text-[30px] leading-[20px] text-white">123456789</Centered>
          <Centered cx={213.5} cy={4922.5} className="font-['Raleway'] text-[10px] leading-[15px] tracking-[-0.17px] text-white">a.n. Raditya M Fadil</Centered>
          <CopyButton x={181} y={4888} label="Copy account number" text="123456789" />
        </Reveal>

        <Reveal at={5050} kind="fadeUp" delay={200}>
          {/* Name and address sit 14px higher than in Figma to make room inside the cup for a Copy
              button like the bank one (Figma's cup has none). */}
          <Img file="cup-orange.webp" x={-2} y={5021} w={380} h={253} />
          <Centered cx={166.5} cy={5124} className="ff-fraunces font-bold text-[25px] leading-[20px] tracking-[-0.017em] text-white">Ratu R</Centered>
          <Centered cx={167} cy={5175.5} className="ff-fraunces text-[10px] leading-[15px] tracking-[-0.017em] text-white">
            Jl. Anggrek Loka No. 24,
            <br />
            RT 005 / RW 002 Kel. Meruya Utara,
            <br />
            Kec. Kembangan Jakarta Barat,
            <br />
            DKI Jakarta, 11620
            <br />
            Phone: 0812-3456-7890
          </Centered>
          <CopyButton x={135} y={5216} label="Copy address" text={ADDRESS} />
        </Reveal>

        <Reveal at={4690} kind="fadeUp">
          <Centered cx={189.5} cy={4699} className={`${friendsTitle} text-[18px] leading-[20px] text-[#a07eb9]`}>Gifting</Centered>
        </Reveal>
        <Reveal at={5010} kind="fadeUp" delay={120}>
          <Centered cx={188.5} cy={5024.5} className="ff-f72-soft text-[12px] leading-[15px] tracking-[-0.017em] text-[#181719]">
            Want to send us a gift?
            <br />
            You can send it to the address below.
          </Centered>
        </Reveal>
        <Reveal at={4985} kind="fadeUp">
          <Centered cx={189} cy={4995} className={`${friendsTitle} text-[18px] leading-[20px] text-[#cd5524]`}>Gift Delivery</Centered>
        </Reveal>

        {/* ===== Couple photo strip ===== */}
        <Reveal at={4276} kind="fade" delay={100}>
          <Img file="couple.webp" x={0} y={4276} w={376} h={376} alt="Ratu & Radit" />
          <Transformed m={[1, 0.006, -0.08, 0.006, -1, 4277.936]} w={375.062} h={25.936}><img alt="" src={A('scallop.svg')} className={fill} /></Transformed>
          <Transformed m={[1, 0.006, -0.08, -0.006, 1, 4647.349]} w={375.062} h={25.936}><img alt="" src={A('scallop.svg')} className={fill} /></Transformed>
        </Reveal>

        {/* ===== Closing ===== */}
        <Reveal at={5555} kind="fadeUp">
          <p className="ff-fraunces -translate-x-1/2 -translate-y-1/2 absolute left-[187.5px] top-[5582px] w-[284px] text-center text-[10px] leading-[13px] tracking-[-0.017em] text-[#181719]">
            Thank you for being part of our story and for celebrating this special moment with us. Having our favorite people by our side makes this day even more meaningful. We can’t wait to laugh, dance, and make more memories together.
          </p>
        </Reveal>
        <Reveal at={5555} kind="fadeUp" delay={150}>
          <Centered cx={187.5} cy={5627.5} className="ff-fraunces text-[26px] leading-[30px] tracking-[-0.017em] text-[#a07eb9]">
            Ratu &amp; Radit
          </Centered>
        </Reveal>

        <Reveal at={666} kind="pop" origin={[187.5, 713.5]} delay={900}>
          <Img file="turkey-dance.webp" x={142} y={666} w={91} h={95} />
        </Reveal>

        {/* ===== Made with love by nicemice (no edge in Figma: the white gradient fades into it) ===== */}
        <MadeWithLoveFooter y={5715} bgTop={5690} frameH={FRAME_H} background="#fefffa" />
      </div>

      {photo !== null && <Lightbox index={photo} onClose={() => setPhoto(null)} />}
    </div>
    </RevealProvider>
  );
}
