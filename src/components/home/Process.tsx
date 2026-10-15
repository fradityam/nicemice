import { CheckIcon } from './icons';

const STEPS = [
  {
    number: '01',
    title: 'Mulai dari tema',
    copy: 'Temukan tema yang paling cocok dengan kisah dan selera kalian.',
    benefit: 'Dari cerita sampai hal favoritmu',
  },
  {
    number: '02',
    title: 'Ceritakan acaramu',
    copy: 'Hubungi via WhatsApp, kirim detail acara, foto, dan informasi yang ingin dicantumkan di undangan.',
    benefit: 'Selesai dalam 3x24 jam',
  },
  {
    number: '03',
    title: 'Siap sebar undangan!',
    copy: 'Cek hasilnya, ya! Kalau perlu penyesuaian, tersedia 2x revisi gratis. Setelah cocok, undanganmu siap disebar.',
    benefit: 'Praktis via HP',
  },
];

export default function Process() {
  return (
    <section className="process" id="cara-pesan">
      <div className="process-title">
        <p className="section-kicker">3 Langkah Pesan</p>
        <h2>Pilih temanya, biar kami urus sisanya</h2>
        <p>
          Cukup kirim detail pernikahanmu, lalu tim Nice Mice akan bantu siapkan undangannya sampai
          siap dibagikan!
        </p>
      </div>
      <div className="steps">
        {STEPS.map((step, index) => (
          <article className="step" key={step.number}>
            <div className="step-number">{step.number}</div>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
            <span className="step-benefit">
              <CheckIcon />
              {step.benefit}
            </span>
            {index < STEPS.length - 1 && (
              <svg className="step-arrow" viewBox="0 0 120 48" aria-hidden="true">
                <path d="M5 31c32-18 65-20 104-4" />
                <path d="m95 15 15 12-18 8" />
              </svg>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
