import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { WEDDING_DATE, weddingDateEn, weddingDateId, weddingDateIdLong } from './lalalandWeddingDate';

// Every layer below is laid out in the Figma "Content" frame's own coordinate space
// (375 × 4641). The whole frame is then scaled uniformly to the column width, so the
// composition stays identical on any phone — positions, sizes and font sizes are the
// Figma values verbatim.
const FRAME_W = 375;
const FRAME_H = 4641;

const assetUrls = import.meta.glob('../../assets/images/lalaland/figma/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const A = (file: string) => assetUrls[`../../assets/images/lalaland/figma/${file}`];

const mask = (file: string, position: string, size: string): CSSProperties => {
  const url = `url("${A(file)}")`;
  return {
    maskImage: url,
    WebkitMaskImage: url,
    maskMode: 'alpha',
    maskComposite: 'intersect',
    WebkitMaskComposite: 'source-in',
    maskClip: 'no-clip',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: position,
    WebkitMaskPosition: position,
    maskSize: size,
    WebkitMaskSize: size,
  };
};

// Paper rip vector: node box is 398.887 × 33.13; the exported SVG adds 1% on each side
// and 24.15% below for the drop shadow.
function PaperRip({ y }: { y: number }) {
  return (
    <img
      alt=""
      src={A('ea3d9.svg')}
      className="absolute block max-w-none"
      style={{ left: -18 - 3.98887, top: y, width: 406.887, height: 41.1304 }}
    />
  );
}

function Hline({ left, top, width, file }: { left: number; top: number; width: number; file: string }) {
  return (
    <div className="absolute h-0" style={{ left, top, width }}>
      <div className="absolute inset-[-1px_0_0_0]">
        <img alt="" className="block max-w-none size-full" src={A(file)} />
      </div>
    </div>
  );
}

function Vline({ left, top, height, file }: { left: number; top: number; height: number; file: string }) {
  return (
    <div className="absolute flex items-center justify-center w-0" style={{ left, top, height }}>
      <div className="flex-none rotate-90">
        <div className="h-0 relative" style={{ width: height }}>
          <div className="absolute inset-[-1px_0_0_0]">
            <img alt="" className="block max-w-none size-full" src={A(file)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SalinButton({ top, label, text }: { top: number; label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <div className="absolute bg-[#efecec] border border-[#accadd] border-solid h-[22px] left-[156px] rounded-[20px] w-[64px]" style={{ top }} />
      <div
        className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Raleway'] font-normal justify-center leading-[0] left-[195.5px] text-[10px] text-[#081a51] text-center tracking-[-0.17px] whitespace-nowrap"
        style={{ top: top + 11.5 }}
      >
        <p className="leading-[15px]">{copied ? 'TERSALIN' : 'SALIN'}</p>
      </div>
      <img alt="" src={A('8ae9e.svg')} className="absolute block max-w-none" style={{ left: 166.01, top: top + 4.33, width: 10.99, height: 13.47 }} />
      <button
        type="button"
        aria-label={label}
        className="absolute left-[156px] h-[22px] w-[64px] rounded-[20px] cursor-pointer"
        style={{ top }}
        onClick={() => {
          navigator.clipboard?.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
      />
    </>
  );
}

// Placeholder location: a Maps search for the venue address shown in the design.
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  'Gedung Serbaguna ABC, Jl. Cempaka No. 18, Kota Bogor, Jawa Barat',
)}`;

const pad2 = (n: number) => String(n).padStart(2, '0');

function CountdownNumbers() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const total = Math.max(0, Math.floor((WEDDING_DATE.getTime() - now) / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor(total / 3600) % 24;
  const minutes = Math.floor(total / 60) % 60;
  const seconds = total % 60;

  return (
    <div className="leading-[normal] text-[#f9de1f] text-center" role="timer" aria-live="off">
      {/* Figma's "137" + "days" group, centred at 188px: the number box is followed by
          "days", overlapping it by 2.1px and sitting 17.13px lower. Built as a row so the
          group stays centred whatever the digit count. */}
      <div className="-translate-x-1/2 absolute flex items-start left-[calc(50%+0.5px)] top-[2551.13px] whitespace-nowrap">
        <span className="font-['Federo'] text-[40px]">{days}</span>
        <span className="font-['Pompiere'] text-[20px] ml-[-2.1px] mt-[17.13px]">days</span>
      </div>
      <p className="-translate-x-1/2 absolute font-['Federo'] h-[27.597px] left-[calc(50%-105.06px)] text-[25px] top-[2612.98px] w-max">{pad2(hours)}</p>
      <p className="-translate-x-1/2 absolute font-['Pompiere'] h-[13.323px] left-[calc(50%-105.68px)] text-[12px] top-[2640.58px] w-[25.815px]">hours</p>
      <p className="-translate-x-1/2 absolute font-['Federo'] h-[27.597px] left-[calc(50%-5.25px)] text-[25px] top-[2612.98px] w-max">{pad2(minutes)}</p>
      <p className="-translate-x-1/2 absolute font-['Pompiere'] h-[13.323px] left-[calc(50%-6.69px)] text-[12px] top-[2640.58px] w-[41.621px]">minutes</p>
      <p className="-translate-x-1/2 absolute font-['Federo'] h-[27.597px] left-[calc(50%+102.47px)] text-[25px] top-[2612.98px] w-max">{pad2(seconds)}</p>
      <p className="-translate-x-1/2 absolute font-['Pompiere'] h-[13.323px] left-[calc(50%+101.86px)] text-[12px] top-[2640.58px] w-[35.282px]">seconds</p>
    </div>
  );
}

const ATTENDANCE = [
  { value: 'hadir', label: 'Akan Hadir', top: 3404 },
  { value: 'mungkin', label: 'Mungkin Hadir', top: 3447 },
  { value: 'berhalangan', label: 'Berhalangan Hadir', top: 3490 },
];

const fieldLabel = "-translate-y-1/2 absolute flex flex-col font-['Pompiere'] justify-center leading-[0] left-[44px] text-[16px] text-[#f1e9dd] tracking-[-0.272px] whitespace-nowrap";
const fieldBox = "absolute left-[37px] w-[302px] bg-white border border-[#fade20] border-solid rounded-[10px]";
const fieldText = "font-['Pompiere'] text-[16px] leading-[20px] tracking-[-0.272px] text-black placeholder:text-[rgba(0,0,0,0.2)] outline-none";

export default function LaLaLandContent() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [attendance, setAttendance] = useState('hadir');

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setScale(el.clientWidth / FRAME_W);
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / FRAME_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full overflow-hidden" style={{ aspectRatio: `${FRAME_W} / ${FRAME_H}` }}>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${scale})` }}
      >
        {/* ===== BG (Figma frame "BG", rendered as one continuous image) ===== */}
        <img alt="" src={A('content-bg.webp')} className="absolute left-0 top-0 block max-w-none" style={{ width: 375, height: 4450 }} />

        {/* ===== First meet ===== */}
        <div className="absolute overflow-hidden" style={{ left: -1, top: 4450, width: 378, height: 191 }}>
          <img
            alt="Sebastian dan Mia saat pertama bertemu"
            className="absolute h-[280.63%] left-[-0.09%] max-w-none top-[-8.38%] w-[100.17%]"
            src={A('b7947.webp')}
          />
        </div>

        <PaperRip y={2248} />
        <PaperRip y={1675} />
        <PaperRip y={3187} />
        <PaperRip y={4433} />
        <PaperRip y={3749} />

        {/* ===== Gift ===== */}
        <div className="absolute inset-[84.49%_10.92%_10.43%_11.24%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('d6919.svg')} />
        </div>
        <div className="absolute inset-[84.25%_63.07%_14.41%_13.07%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('5428d.svg')} />
        </div>
        <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Pompiere'] justify-center leading-[0] left-[calc(50%+0.5px)] text-[30px] text-[#081a51] text-center top-[3987px] tracking-[-0.51px] whitespace-nowrap">
          <p className="leading-[20px]">Bank BCA</p>
        </div>
        <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Pompiere'] justify-center leading-[0] left-1/2 text-[40px] text-[#081a51] text-center top-[4036px] whitespace-nowrap">
          <p className="leading-[20px]">123456789</p>
        </div>
        <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Pompiere'] justify-center leading-[0] left-[188.5px] text-[16px] text-[#081a51] text-center top-[4102.5px] tracking-[-0.272px] whitespace-nowrap">
          <p className="leading-[15px]">a.n. Mia Dolan</p>
        </div>
        <SalinButton top={4057} label="Salin nomor rekening" text="123456789" />

        <div className="absolute inset-[89.97%_10.92%_4.96%_11.24%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('d6919.svg')} />
        </div>
        <div className="absolute flex inset-[89.42%_6.49%_8.45%_64.53%] items-center justify-center" style={{ containerType: 'size' }}>
          <div className="flex-none h-[hypot(-28.945cqw,54.2471cqh)] rotate-[30.38deg] w-[hypot(71.055cqw,45.7529cqh)]">
            <div className="relative size-full">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('5d942.svg')} />
            </div>
          </div>
        </div>
        <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Pompiere'] justify-center leading-[0] left-[calc(50%+1px)] text-[#29567f] text-[30px] text-center top-[4233px] tracking-[-0.51px] whitespace-nowrap">
          <p className="leading-[20px]">Sebastian W</p>
        </div>
        <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Pompiere'] justify-center leading-[0] left-[188px] text-[#29567f] text-[15px] text-center top-[4298.5px] tracking-[-0.255px] whitespace-nowrap">
          <p className="leading-[19px] whitespace-pre">{'Jl. Anggrek Loka No. 24, '}</p>
          <p className="leading-[19px] whitespace-pre">{'RT 005 / RW 002 Kel. Meruya Utara, '}</p>
          <p className="leading-[19px] whitespace-pre">{'Kec. Kembangan Jakarta Barat, '}</p>
          <p className="leading-[19px] whitespace-pre">DKI Jakarta, 11620</p>
          <p className="leading-[19px] whitespace-pre">No. HP: 0812-3456-7890</p>
        </div>
        <SalinButton
          top={4351}
          label="Salin alamat"
          text="Sebastian W, Jl. Anggrek Loka No. 24, RT 005 / RW 002 Kel. Meruya Utara, Kec. Kembangan Jakarta Barat, DKI Jakarta, 11620. No. HP: 0812-3456-7890"
        />
        <p className="-translate-x-1/2 absolute font-['Pompiere'] leading-[normal] left-[187.5px] text-[18px] text-[#f1e9dd] text-center top-[3838px] w-max whitespace-nowrap">
          Doa restu Anda adalah karunia yang berarti bagi kami.
          <br />
          Jika ingin memberi tanda kasih, kami dengan senang hati
          <br />
          menerimanya melalui:
        </p>
        <p className="-translate-x-1/2 absolute font-['Federo'] leading-[normal] left-[calc(50%+1px)] text-[#fade20] text-[25px] text-center top-[3802px] whitespace-nowrap">
          Tanda Kasih
        </p>

        {/* ===== Konfirmasi Kehadiran (RSVP) ===== */}
        <form onSubmit={(e) => e.preventDefault()}>
          <div className={fieldLabel} style={{ top: 3313 }}>
            <label htmlFor="rsvp-nama" className="leading-[20px]">Nama</label>
          </div>
          <input
            id="rsvp-nama"
            name="nama"
            placeholder="Nama Anda"
            className={`${fieldBox} ${fieldText} h-[38px] top-[3328px] pl-[14px] pr-[14px]`}
          />

          <div className={fieldLabel} style={{ top: 3389 }}>
            <p className="leading-[20px]">Konfirmasi Kehadiran</p>
          </div>
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
              <span className="-translate-y-1/2 absolute left-[39px] top-[18px] font-['Pompiere'] text-[16px] leading-[20px] tracking-[-0.272px] text-black whitespace-nowrap">
                {opt.label}
              </span>
            </label>
          ))}

          <div className={fieldLabel} style={{ top: 3552 }}>
            <label htmlFor="rsvp-pesan" className="leading-[20px]">Pesan/Ucapan</label>
          </div>
          <textarea
            id="rsvp-pesan"
            name="pesan"
            placeholder="Tulis doa & ucapan Anda..."
            className={`${fieldBox} ${fieldText} h-[104px] top-[3567px] pl-[14px] pr-[14px] pt-[8px] resize-none`}
          />

          <button
            type="submit"
            className="-translate-x-1/2 absolute bg-[#f9de1f] h-[38px] left-[calc(50%+0.5px)] rounded-[10px] top-[3680px] w-[302px] cursor-pointer"
          >
            <span className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 font-['Pompiere'] text-[20px] leading-[20px] text-[#000433] tracking-[2px] whitespace-nowrap">
              KIRIM UCAPAN
            </span>
          </button>
        </form>

        <p className="-translate-x-1/2 absolute font-['Federo'] leading-[normal] text-[27px] text-center text-white whitespace-nowrap" style={{ left: 70 + 237 / 2, top: 3251 }}>
          Konfirmasi Kehadiran
        </p>

        {/* ===== Love Story ===== */}
        {/* Body paragraphs carry small relative top offsets: Figma lays out these mixed
            line-heights (15px first word, 12px rest, 9px title in one block) lower than CSS
            does; offsets are measured against the Figma render. */}
        <div className="absolute inset-[60.98%_6.25%_31.78%_5.33%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('22121.svg')} />
        </div>
        <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Fasthand'] justify-center leading-[0] left-[186.78px] text-[#fade20] text-[30px] text-center top-[2806px] tracking-[-0.51px] whitespace-nowrap">
          <p className="leading-[20px]">Cerita Kami...</p>
        </div>
        <div className="-translate-x-full -translate-y-1/2 absolute flex flex-col font-['Raleway'] font-normal h-[83px] justify-center leading-[0] left-[159.78px] text-[0px] text-right text-white top-[2883.5px] tracking-[-0.17px] w-max whitespace-nowrap">
          <p className="font-bold leading-[12px] text-[12px]">1 Juni 2018</p>
          <p className="relative top-[1.5px] text-[10px]">
            <span className="leading-[15px]">Berawal</span>
            <span className="leading-[12px]">
              {' dari dikenalkan oleh'}<br />teman kantor. Tak disangka,<br />perkenalan sederhana ini<br />menjadi awal dari perjalanan<br />kami.
            </span>
          </p>
        </div>
        <div className="-translate-x-full -translate-y-1/2 absolute flex flex-col font-['Raleway'] font-normal h-[85px] justify-center leading-[0] left-[159.78px] text-[0px] text-right text-white top-[3035.5px] tracking-[-0.17px] w-max whitespace-nowrap">
          <p className="font-bold leading-[12px] text-[12px]">19 Desember 2025</p>
          <p className="relative top-[1.5px] text-[10px]">
            <span className="leading-[15px]">Setelah</span>
            <span className="leading-[12px]">
              {' bertahun-tahun'}<br />melewati suka dan duka<br />bersama, kami mengikat janji<br />untuk melangkah ke tahap<br />berikutnya.
            </span>
          </p>
        </div>
        <div className="-translate-y-1/2 absolute flex flex-col font-['Raleway'] font-normal h-[86px] justify-center leading-[0] left-[209.78px] text-[0px] text-white top-[2962px] tracking-[-0.119px] w-max whitespace-nowrap">
          <p className="font-bold leading-[9px] text-[12px]">14 Agustus 2018</p>
          <p className="relative top-[3px] text-[10px]">
            <span className="leading-[15px]">Setelah</span>
            <span className="leading-[12px]">
              {' kurang lebih dua bulan'}<br />PDKT, akhirnya kami<br />memutuskan untuk menjalin<br />hubungan dan memulai cerita<br />sebagai pasangan.
            </span>
          </p>
        </div>
        <div className="-translate-y-1/2 absolute flex flex-col font-['Raleway'] font-normal h-[93px] justify-center leading-[0] left-[209.78px] text-[0px] text-white top-[3112.5px] tracking-[-0.17px] w-max whitespace-nowrap">
          <p className="font-bold leading-[12px] text-[12px]">{weddingDateId}</p>
          <p className="relative top-[1.5px] text-[10px]">
            <span className="leading-[15px]">Hari</span>
            <span className="leading-[12px]">
              {' di mana cerita kami'}<br />berlanjut ke babak baru. Bukan<br />lagi sekadar tentang aku dan<br />kamu, tapi tentang kita dan<br />selamanya.
            </span>
          </p>
        </div>

        {/* Mirrored in Figma: the node's reported x (386) is its flipped origin, i.e. its right edge. */}
        <img alt="" src={A('45e9d.svg')} className="absolute block max-w-none -scale-x-100" style={{ left: 386 - 67, top: 2770.1267, width: 67, height: 80.9566 }} />
        <img alt="" src={A('3d7c2.svg')} className="absolute block max-w-none" style={{ left: 27, top: 3145, width: 40.8687, height: 32.4681 }} />

        {/* ===== Countdown ===== */}
        <div className="-translate-x-1/2 absolute bg-[#081a51] border border-[#f9de1f] border-solid h-[194.129px] left-[calc(50%+2.85px)] rounded-[10px] top-[2516.87px] w-[299.758px]" />
        <div className="-translate-x-1/2 absolute bg-[#081a51] border border-[#f9de1f] border-solid h-[194.129px] left-[calc(50%-2.85px)] rounded-[10px] top-[2512.11px] w-[299.758px]" />
        <p className="-translate-x-1/2 absolute font-['Pompiere'] h-[17px] leading-[normal] left-[calc(50%+0.5px)] text-[15px] text-[#f9de1f] text-center top-[2677px] w-max whitespace-nowrap">
          to {weddingDateEn}
        </p>
        <p className="-translate-x-1/2 absolute font-['Federo'] h-[17px] leading-[normal] left-1/2 text-[15px] text-[#f9de1f] text-center top-[2524px] w-[99px]">
          Countdown
        </p>
        <Hline left={34.77} top={2600.61} width={299.758} file="13eeb.svg" />
        <CountdownNumbers />
        <Hline left={34.77} top={2550.18} width={299.758} file="13eeb.svg" />
        <Hline left={34.77} top={2600.61} width={299.758} file="13eeb.svg" />
        <Hline left={34.77} top={2665.32} width={299.758} file="13eeb.svg" />
        <Vline left={127.07} top={2600.61} height={64.71} file="09364.svg" />
        <Vline left={236.51} top={2600.61} height={64.71} file="09364.svg" />

        {/* ===== Detail Acara ===== */}
        <div className="-translate-x-1/2 absolute bg-[#081a51] border border-[#f9de1f] border-solid h-[114.194px] left-[calc(50%+2.85px)] rounded-[10px] top-[2377.94px] w-[299.758px]" />
        <div className="-translate-x-1/2 absolute bg-[#081a51] border border-[#f9de1f] border-solid h-[114.194px] left-[calc(50%-2.85px)] rounded-[10px] top-[2373.18px] w-[299.758px]" />
        <p className="-translate-x-1/2 absolute font-['Federo'] h-[17px] leading-[normal] left-[calc(50%-73.5px)] text-[13px] text-[#f9de1f] text-center top-[2381px] w-[96px]">
          Akad Nikah
        </p>
        <p className="absolute font-['Pompiere'] h-[19.032px] leading-[normal] left-[calc(50%-104.2px)] text-[15px] text-[#f9de1f] top-[2404.58px] w-[75.177px] whitespace-nowrap">
          08.00 - 11.00
        </p>
        <div className="absolute inset-[51.83%_79.31%_47.86%_16.88%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('11f60.svg')} />
        </div>
        <p className="-translate-x-1/2 absolute font-['Federo'] h-[17.129px] leading-[normal] left-[calc(50%+69.94px)] text-[13px] text-[#f9de1f] text-center top-[2380.79px] w-[43.774px] whitespace-nowrap">
          Resepsi
        </p>
        <p className="absolute font-['Pompiere'] h-[19.032px] leading-[normal] left-[calc(50%+43.3px)] text-[15px] text-[#f9de1f] top-[2404.58px] w-[73.274px] whitespace-nowrap">
          11.00 - selesai
        </p>
        <div className="absolute inset-[51.83%_39.98%_47.86%_56.22%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('11f60.svg')} />
        </div>
        <Vline left={187.5 - 0.48} top={2374.13} height={56.145} file="dbaf3.svg" />
        <Hline left={35.72} top={2430.27} width={298.806} file="df509.svg" />
        <div className="absolute bg-[#fade20] h-[22.839px] left-[220.33px] rounded-[100px] top-[2445.5px] w-[95.161px]" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Raleway'] font-normal h-[19.032px] justify-center leading-[0] left-[275.52px] text-[10px] text-[#081a51] text-center top-[2456.92px] tracking-[-0.17px] w-[60.903px]">
          <p className="leading-[20px]">Lihat Lokasi</p>
        </div>
        <div className="absolute left-[228.9px] overflow-clip size-[14.274px] top-[2449.31px]">
          <div className="absolute inset-[0_14.58%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('030b0.svg')} />
          </div>
        </div>
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Lihat lokasi di Google Maps"
          className="absolute h-[22.839px] left-[220.33px] rounded-[100px] top-[2445.5px] w-[95.161px]"
        />
        <p className="absolute font-['Federo'] h-[17.129px] leading-[normal] left-[57.6px] text-[#fade20] text-[13px] top-[2441.69px] w-[147.5px] whitespace-nowrap">
          Gedung Serbaguna ABC
        </p>
        <p className="absolute font-['Pompiere'] h-[11px] leading-[normal] left-[58px] text-[#fade20] text-[10px] top-[2459px] w-[147px] whitespace-nowrap">
          Jl. Cempaka No. 18, Kota Bogor, Jawa Barat
        </p>
        <p className="-translate-x-1/2 absolute font-['Federo'] h-[27.597px] leading-[normal] left-[calc(50%+0.48px)] text-[#fade20] text-[23px] text-center top-[2325.6px] w-max whitespace-nowrap">
          {weddingDateIdLong}
        </p>
        <p className="-translate-x-1/2 absolute font-['Pompiere'] h-[22.839px] leading-[normal] left-[calc(50%+0.95px)] text-[18px] text-center text-white top-[2298px] w-max whitespace-nowrap">
          Acara akan dilangsungkan pada:
        </p>

        {/* ===== Prewed ===== */}
        <div className="-translate-x-1/2 absolute h-[403px] left-1/2 rounded-[20px] top-[1737px] w-[315px] overflow-hidden">
          <img alt="Foto pre-wedding Sebastian & Mia" className="absolute h-[114.03%] left-[-2.27%] max-w-none top-[-14.03%] w-[103.02%]" src={A('498fb.webp')} />
        </div>
        {[
          { left: 30, w: 70, file: '1a1e9.webp' },
          { left: 112, w: 69, file: '6e588.webp' },
          { left: 194, w: 69, file: '200d5.webp' },
          { left: 275, w: 70, file: '5b958.webp' },
        ].map((p) => (
          <img
            key={p.file}
            alt=""
            src={A(p.file)}
            className="absolute max-w-none object-cover rounded-[10px] top-[2159px] h-[70px]"
            style={{ left: p.left, width: p.w }}
          />
        ))}

        {/* ===== Bride ===== */}
        <div className="absolute flex inset-[27.9%_21.99%_65.99%_18.79%] items-center justify-center" style={{ containerType: 'size' }}>
          <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
            <div className="relative size-full">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('45f28.svg')} />
            </div>
          </div>
        </div>
        <div className="absolute left-[28.45px] size-[299px] top-[1288px]" style={mask('53719-mirrored.svg', '50.098px 14.653px', '211.419px 278.236px')}>
          <img alt="Mia Dolan" className="absolute inset-0 max-w-none object-cover size-full" src={A('c95c9.webp')} />
        </div>
        <div className="absolute flex inset-[27.93%_24.37%_65.98%_19.78%] items-center justify-center" style={{ containerType: 'size' }}>
          <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
            <div className="relative size-full">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('6ebf7.svg')} />
            </div>
          </div>
        </div>
        <div className="absolute flex inset-[27.95%_20.53%_65.65%_18.87%] items-center justify-center" style={{ containerType: 'size' }}>
          <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
            <div className="relative size-full">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('ed8ee.svg')} />
            </div>
          </div>
        </div>
        <p className="-translate-x-1/2 absolute font-['Fasthand'] leading-[normal] left-1/2 text-[25px] text-center text-white top-[1594px] whitespace-nowrap">
          Mia Dolan
        </p>
        <p className="-translate-x-1/2 absolute font-['Pompiere'] leading-[normal] left-[calc(50%-0.5px)] text-[18px] text-center text-white top-[1639px] whitespace-nowrap">
          Putri dari Bapak Jerome P dan Ibu Cania C
        </p>

        {/* ===== Groom ===== */}
        <div className="absolute inset-[19.31%_21.99%_74.59%_18.79%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('45f28.svg')} />
        </div>
        <div className="absolute inset-[19.36%_8.54%_73.77%_6.46%]" style={mask('53719.svg', '48.814px 5.235px', '211.419px 278.236px')}>
          <img alt="Sebastian Wilder" className="absolute left-0 top-0 max-w-none size-full" src={A('68dbe.webp')} />
        </div>
        <div className="absolute inset-[19.34%_22.98%_74.57%_21.17%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('6ebf7.svg')} />
        </div>
        <div className="absolute inset-[19.36%_22.07%_74.25%_17.33%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('ed8ee.svg')} />
        </div>
        <p className="-translate-x-1/2 absolute font-['Fasthand'] leading-[normal] left-1/2 text-[25px] text-center text-white top-[1195px] whitespace-nowrap">
          Sebastian Wilder
        </p>
        <p className="-translate-x-1/2 absolute font-['Pompiere'] leading-[normal] left-1/2 text-[18px] text-center text-white top-[1240px] whitespace-nowrap">
          Putra dari Bapak Ari W dan Ibu Dian S
        </p>

        {/* ===== Intro text ===== */}
        <p className="-translate-x-1/2 absolute font-['Pompiere'] leading-[normal] left-1/2 text-[18px] text-center text-white top-[809px] w-max whitespace-nowrap">
          Dengan penuh kebahagiaan,
          <br />
          kami mengundang Anda untuk menjadi bagian
          <br />
          dari hari ketika kisah kami memasuki babak baru.
        </p>

        {/* ===== Couple and star ===== */}
        <div className="absolute inset-[11.44%_13.48%_82.98%_12.55%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('c0e6c.svg')} />
        </div>
        <img
          alt="Sebastian & Mia berdansa"
          src={A('71976.webp')}
          className="absolute max-w-none object-cover"
          style={{ left: 15.19, top: 531, width: 327.896, height: 263 }}
        />

        {/* ===== Quotes ===== */}
        <div className="absolute inset-[0.88%_9.22%_88.71%_9.22%] mix-blend-multiply">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('fa428.svg')} />
        </div>
        <div className="absolute inset-[1.21%_13.78%_89.22%_14.25%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('2af26.svg')} />
        </div>
        <div className="absolute inset-[1.58%_16.18%_92.99%_16.65%]" style={mask('372a1.svg', '7.871px -0.447px', '236.147px 251.888px')}>
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={A('9ecb6.svg')} />
        </div>
        <div className="absolute inset-[-0.03%_16.71%_89.85%_12.34%]" style={mask('372a1.svg', '24.054px 74.392px', '236.147px 251.888px')}>
          <img alt="Sebastian & Mia di bioskop" className="absolute left-0 top-0 max-w-none size-full" src={A('8d654.webp')} />
        </div>
        <p className="-translate-x-1/2 absolute font-['Pompiere'] leading-[26px] left-1/2 text-[22px] text-[#000433] text-center top-[357px] w-max whitespace-nowrap">
          Here's to the ones who dream,
          <br />
          foolish as they may seem. Here's
          <br />
          to the hearts that ache. Here's to
          <br />
          the mess we make.
        </p>

        {/* ===== Top-most layers ===== */}
        <div className="absolute" style={{ left: -45, top: 2595, width: 132, height: 159 }}>
          <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={A('968d4.webp')} />
        </div>
        <div className="absolute overflow-hidden" style={{ left: 260, top: 2627, width: 126, height: 130 }}>
          <img alt="" className="absolute h-[106.04%] left-[-0.11%] max-w-none top-0 w-[100.21%]" src={A('12bdd.webp')} />
        </div>
        <PaperRip y={2738} />
        <div className="absolute font-['Pompiere'] text-[26px] text-white whitespace-nowrap" style={{ left: 25, top: 4490 }}>
          <p className="leading-[28px] whitespace-pre">{'I guess I’ll see you '}</p>
          <p className="leading-[28px] whitespace-pre">on our big day</p>
        </div>
      </div>
    </div>
  );
}
